package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.model.entity.ExamStudentScore;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.model.entity.StudentExamAiReport;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.repository.ExamProjectRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.repository.StudentExamAiReportRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.ExamAnalysisService;
import com.edu.javasb_back.service.OssStorageService;
import com.edu.javasb_back.service.ScoreAiReportService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

@Service
public class ScoreAiReportServiceImpl implements ScoreAiReportService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysStudentRepository studentRepository;

    @Autowired
    private ExamProjectRepository examProjectRepository;

    @Autowired
    private ExamClassRepository examClassRepository;

    @Autowired
    private ExamSubjectRepository examSubjectRepository;

    @Autowired
    private ExamStudentScoreRepository examStudentScoreRepository;

    @Autowired
    private StudentExamAiReportRepository studentExamAiReportRepository;

    @Autowired
    private ExamAnalysisService examAnalysisService;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private OssStorageService ossStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public Result<Map<String, Object>> getExamAiReport(Long uid, String examId) {
        if (uid == null) {
            return Result.error("请先登录");
        }
        if (!StringUtils.hasText(examId)) {
            return Result.error("考试项目ID不能为空");
        }

        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) {
            return Result.error("未绑定学生账号");
        }

        SysStudent student = studentOpt.get();
        ExamProject project = examProjectRepository.findById(examId).orElse(null);
        if (project == null) {
            return Result.error("考试项目不存在");
        }

        ExamClass examClass = resolveExamClass(project.getId(), student);
        if (examClass == null) {
            return Result.error("未找到该学生在当前考试项目中的班级信息");
        }

        Optional<StudentExamAiReport> cached = studentExamAiReportRepository.findByProjectIdAndStudentNo(project.getId(), student.getStudentNo());
        if (cached.isPresent() && StringUtils.hasText(cached.get().getReportContent())) {
            return Result.success(buildClientPayload(readJsonMap(cached.get().getReportContent()), true, cached.get().getModelName(), cached.get().getUpdateTime()));
        }

        if (!StringUtils.hasText(globalConfigProperties.getQwenApiKey())) {
            return Result.error("API Key 未配置，请联系管理员");
        }

        ProjectContext context = buildProjectContext(project, examClass, student);
        if (!context.ok()) {
            return Result.error(context.message());
        }

        Result<Map<String, Object>> reportResult = examAnalysisService.getStudentReport(project.getId(), examClass.getId(), student.getStudentNo());
        if (reportResult.getCode() != 200 || reportResult.getData() == null) {
            return Result.error(reportResult.getMsg() == null ? "生成 AI 报告所需成绩数据不足" : reportResult.getMsg());
        }

        Map<String, Object> analysisData = reportResult.getData();
        Map<String, Object> sourceSnapshot = buildSourceSnapshot(context, analysisData);
        Map<String, Object> aiReport = requestQwenReport(sourceSnapshot);

        StudentExamAiReport entity = cached.orElseGet(StudentExamAiReport::new);
        if (!StringUtils.hasText(entity.getId())) {
            entity.setId("AR" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 6));
        }
        entity.setProjectId(project.getId());
        entity.setStudentNo(student.getStudentNo());
        entity.setStudentName(student.getName());
        entity.setSchoolId(examClass.getSchoolId());
        entity.setClassId(examClass.getId());
        entity.setModelName(resolveQwenModel());
        entity.setPromptVersion(resolvePromptVersion());
        entity.setReportContent(writeJson(aiReport));
        entity.setSourceSnapshot(writeJson(sourceSnapshot));
        entity.setStatus("SUCCESS");
        studentExamAiReportRepository.saveAndFlush(entity);

        return Result.success(buildClientPayload(aiReport, false, entity.getModelName(), entity.getCreateTime()));
    }

    @Override
    @Transactional
    public Result<String> exportExamAiReport(Long uid, String examId) {
        Result<Map<String, Object>> reportResult = getExamAiReport(uid, examId);
        if (reportResult.getCode() != 200 || reportResult.getData() == null) {
            return Result.error(reportResult.getMsg());
        }

        Map<String, Object> data = reportResult.getData();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        ExamProject project = examProjectRepository.findById(examId).orElse(null);

        if (studentOpt.isEmpty() || project == null) {
            return Result.error("数据异常");
        }

        Optional<StudentExamAiReport> cachedEntity = studentExamAiReportRepository
                .findByProjectIdAndStudentNo(examId, studentOpt.get().getStudentNo());
        Map<String, Object> sourceSnapshot = cachedEntity
                .map(StudentExamAiReport::getSourceSnapshot)
                .filter(StringUtils::hasText)
                .map(this::readJsonMap)
                .orElse(Collections.emptyMap());
        Map<String, Object> totalScore = map(sourceSnapshot.get("totalScore"));
        List<Map<String, Object>> subjectRows = listMap(sourceSnapshot.get("subjects"));

        try (PDDocument document = new PDDocument()) {
            PdfRenderContext context = new PdfRenderContext(document);

            context.drawTitle("AI 成绩分析报告", 48, true);
            context.drawText(project.getName(), 24, false, new Color(100, 116, 139));
            context.drawText("学生：" + studentOpt.get().getName() + " (" + studentOpt.get().getStudentNo() + ")", 24, false, new Color(100, 116, 139));
            context.drawText("学校：" + studentOpt.get().getSchool() + "    班级：" + studentOpt.get().getClassName(), 22, false, new Color(100, 116, 139));
            context.drawText("生成时间：" + data.get("generatedAt"), 20, false, new Color(148, 163, 184));
            context.addSpace(40);

            context.drawSectionTitle("一、考试基础数据");
            if (!subjectRows.isEmpty()) {
                context.drawScoreTable(subjectRows, totalScore);
                context.addSpace(18);
                context.drawImage(buildSubjectBarChart(subjectRows), PAGE_WIDTH - PAGE_MARGIN * 2, 360);
                context.addSpace(20);
            }

            context.drawSectionTitle("二、总分成绩分析");
            context.drawSubTitle("（一）一分四率分析");
            context.drawNumberedList(buildOneScoreFourRateLines(totalScore, subjectRows), new Color(37, 99, 235));
            context.addSpace(12);
            context.drawSubTitle("（二）临界生分析");
            context.drawBullets(buildBorderlineLines(totalScore), new Color(59, 130, 246));
            context.addSpace(24);

            context.drawSectionTitle("三、单学科表现总结");
            context.drawNumberedList(buildSubjectPerformanceLines(subjectRows), new Color(37, 99, 235));
            context.addSpace(12);
            context.drawText("图表：各科个人得分率与年级平均得分率柱形对比", 22, false, new Color(100, 116, 139));
            context.addSpace(24);

            context.drawSectionTitle("四、知识点强弱分析");
            context.drawSubTitle("（一）优势知识点");
            context.drawBullets(buildKnowledgePointStrengthLines(data, subjectRows), new Color(22, 163, 74));
            context.drawSubTitle("（二）薄弱知识点");
            context.drawBullets(buildKnowledgePointWeaknessLines(data, sourceSnapshot), new Color(220, 38, 38));
            context.addSpace(24);

            context.drawSectionTitle("五、分阶段学习提升计划");
            Map<String, List<String>> studyPlan = buildStudyPlanSections(data, subjectRows, totalScore);
            for (Map.Entry<String, List<String>> entry : studyPlan.entrySet()) {
                context.drawSubTitle(entry.getKey());
                context.drawBullets(entry.getValue(), new Color(59, 130, 246));
            }
            context.addSpace(24);

            context.drawSectionTitle("六、教师专属指导通道");
            context.drawText("若学习过程中遇到知识点疑惑、计划执行困难，可扫码联系专属学科老师，获得一对一针对性辅导。", 24, false, new Color(51, 65, 85));
            BufferedImage tutorImage = loadTeacherGuideImage();
            if (tutorImage != null) {
                context.drawImage(tutorImage, 260, 260);
                context.addSpace(12);
            }
            context.addSpace(20);

            context.drawSectionTitle("七、报告总结");
            Map<String, Object> summary = map(data.get("summary"));
            context.drawText(asString(summary.get("overallComment")), 26, false, new Color(51, 65, 85));
            context.addSpace(20);
            context.drawBullets(buildFinalSummaryLines(data, subjectRows, totalScore), new Color(37, 99, 235));

            context.finish();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);

            String fileName = "ai_report_" + studentOpt.get().getStudentNo() + "_" + examId + "_" + System.currentTimeMillis() + ".pdf";
            String objectKey = "exports/reports/" + fileName;
            String url = ossStorageService.uploadBytes(baos.toByteArray(), objectKey, "application/pdf");

            return Result.success("导出成功", url);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导出失败：" + e.getMessage());
        }
    }

    private static final int PAGE_WIDTH = 1240;
    private static final int PAGE_HEIGHT = 1754;
    private static final int PAGE_MARGIN = 80;

    private class PdfRenderContext {
        private final PDDocument document;
        private BufferedImage currentCanvas;
        private Graphics2D currentGraphics;
        private int currentY;
        private final int contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2;

        public PdfRenderContext(PDDocument document) {
            this.document = document;
            this.currentY = PAGE_MARGIN;
            createNewPage();
        }

        private void createNewPage() {
            if (currentGraphics != null) {
                currentGraphics.dispose();
                appendCurrentPage();
            }
            currentCanvas = new BufferedImage(PAGE_WIDTH, PAGE_HEIGHT, BufferedImage.TYPE_INT_RGB);
            currentGraphics = currentCanvas.createGraphics();
            currentGraphics.setColor(Color.WHITE);
            currentGraphics.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
            currentGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            currentGraphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            currentY = PAGE_MARGIN;
        }

        private void appendCurrentPage() {
            try {
                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                PDImageXObject pdImage = LosslessFactory.createFromImage(document, currentCanvas);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    contentStream.drawImage(pdImage, 0, 0, PDRectangle.A4.getWidth(), PDRectangle.A4.getHeight());
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to append page", e);
            }
        }

        public void finish() {
            if (currentGraphics != null) {
                currentGraphics.dispose();
                appendCurrentPage();
                currentGraphics = null;
            }
        }

        public void drawTitle(String text, int size, boolean bold) {
            currentY = drawWrappedText(currentGraphics, text, PAGE_MARGIN, currentY, contentWidth, new Font("Microsoft YaHei", bold ? Font.BOLD : Font.PLAIN, size), new Color(15, 23, 42), size + 20);
            currentY += 10;
        }

        public void drawSectionTitle(String text) {
            checkSpace(60);
            currentGraphics.setColor(new Color(37, 99, 235));
            currentGraphics.fillRect(PAGE_MARGIN, currentY, 8, 36);
            currentY = drawWrappedText(currentGraphics, text, PAGE_MARGIN + 24, currentY, contentWidth - 24, new Font("Microsoft YaHei", Font.BOLD, 32), new Color(30, 41, 59), 48);
            currentY += 20;
        }

        public void drawSubTitle(String text) {
            checkSpace(50);
            currentY = drawWrappedText(currentGraphics, text, PAGE_MARGIN, currentY, contentWidth, new Font("Microsoft YaHei", Font.BOLD, 28), new Color(51, 65, 85), 40);
            currentY += 10;
        }

        public void drawText(String text, int size, boolean bold, Color color) {
            if (!StringUtils.hasText(text)) return;
            checkSpace(size + 10);
            currentY = drawWrappedText(currentGraphics, text, PAGE_MARGIN, currentY, contentWidth, new Font("Microsoft YaHei", bold ? Font.BOLD : Font.PLAIN, size), color, size + 14);
            currentY += 8;
        }

        public void drawLabelText(String label, String text) {
            if (!StringUtils.hasText(text)) return;
            checkSpace(40);
            currentGraphics.setFont(new Font("Microsoft YaHei", Font.BOLD, 26));
            currentGraphics.setColor(new Color(37, 99, 235));
            currentGraphics.drawString(label + "：", PAGE_MARGIN, currentY + 26);
            int labelWidth = currentGraphics.getFontMetrics().stringWidth(label + "：");
            currentY = drawWrappedText(currentGraphics, text, PAGE_MARGIN + labelWidth, currentY, contentWidth - labelWidth, new Font("Microsoft YaHei", Font.PLAIN, 26), new Color(71, 85, 105), 40);
            currentY += 5;
        }

        public void drawBullets(List<String> items, Color color) {
            if (items == null || items.isEmpty()) return;
            for (String item : items) {
                checkSpace(40);
                currentGraphics.setColor(color);
                currentGraphics.fillOval(PAGE_MARGIN + 10, currentY + 15, 8, 8);
                currentY = drawWrappedText(currentGraphics, item, PAGE_MARGIN + 35, currentY, contentWidth - 35, new Font("Microsoft YaHei", Font.PLAIN, 26), new Color(71, 85, 105), 40);
                currentY += 5;
            }
            currentY += 10;
        }

        public void drawNumberedList(List<String> items, Color color) {
            if (items == null || items.isEmpty()) return;
            for (int index = 0; index < items.size(); index++) {
                String prefix = (index + 1) + ". ";
                checkSpace(40);
                currentGraphics.setFont(new Font("Microsoft YaHei", Font.BOLD, 26));
                currentGraphics.setColor(color);
                currentGraphics.drawString(prefix, PAGE_MARGIN, currentY + 26);
                int prefixWidth = currentGraphics.getFontMetrics().stringWidth(prefix);
                currentY = drawWrappedText(currentGraphics, items.get(index), PAGE_MARGIN + prefixWidth + 8, currentY, contentWidth - prefixWidth - 8, new Font("Microsoft YaHei", Font.PLAIN, 26), new Color(71, 85, 105), 40);
                currentY += 5;
            }
            currentY += 10;
        }

        public void drawScoreTable(List<Map<String, Object>> subjectRows, Map<String, Object> totalScore) {
            if (subjectRows == null || subjectRows.isEmpty()) return;
            int rowHeight = 52;
            int tableWidth = contentWidth;
            int[] colWidths = { 120, 120, 120, 120, 120, 120, 100 };
            int tableHeight = rowHeight * (subjectRows.size() + 2);
            checkSpace(tableHeight + 20);

            String[] headers = { "科目", "个人成绩", "班级平均", "年级平均", "校平均", "联考平均", "满分" };
            int startX = PAGE_MARGIN;
            int startY = currentY;

            currentGraphics.setColor(new Color(248, 250, 252));
            currentGraphics.fillRoundRect(startX, startY, tableWidth, tableHeight, 16, 16);
            currentGraphics.setColor(new Color(203, 213, 225));
            currentGraphics.drawRoundRect(startX, startY, tableWidth, tableHeight, 16, 16);

            int x = startX;
            for (int i = 0; i < headers.length; i++) {
                drawTableCell(headers[i], x, startY, colWidths[i], rowHeight, true);
                x += colWidths[i];
            }

            int currentRowY = startY + rowHeight;
            for (Map<String, Object> row : subjectRows) {
                x = startX;
                drawTableCell(asString(row.get("subjectName")), x, currentRowY, colWidths[0], rowHeight, false); x += colWidths[0];
                drawTableCell(formatNumber(row.get("score")), x, currentRowY, colWidths[1], rowHeight, false); x += colWidths[1];
                drawTableCell(formatNumber(row.get("classAverage")), x, currentRowY, colWidths[2], rowHeight, false); x += colWidths[2];
                drawTableCell(formatNumber(row.get("gradeAverage")), x, currentRowY, colWidths[3], rowHeight, false); x += colWidths[3];
                drawTableCell(formatNumber(row.get("schoolAverage")), x, currentRowY, colWidths[4], rowHeight, false); x += colWidths[4];
                drawTableCell(formatNumber(row.get("projectAverage")), x, currentRowY, colWidths[5], rowHeight, false); x += colWidths[5];
                drawTableCell(formatNumber(row.get("fullScore")), x, currentRowY, colWidths[6], rowHeight, false);
                currentRowY += rowHeight;
            }

            x = startX;
            drawTableCell("总分", x, currentRowY, colWidths[0], rowHeight, true); x += colWidths[0];
            drawTableCell(formatNumber(totalScore.get("studentScore")), x, currentRowY, colWidths[1], rowHeight, true); x += colWidths[1];
            drawTableCell(formatNumber(totalScore.get("classAverage")), x, currentRowY, colWidths[2], rowHeight, true); x += colWidths[2];
            drawTableCell(formatNumber(totalScore.get("gradeAverage")), x, currentRowY, colWidths[3], rowHeight, true); x += colWidths[3];
            drawTableCell(formatNumber(totalScore.get("schoolAverage")), x, currentRowY, colWidths[4], rowHeight, true); x += colWidths[4];
            drawTableCell(formatNumber(totalScore.get("projectAverage")), x, currentRowY, colWidths[5], rowHeight, true); x += colWidths[5];
            drawTableCell(formatNumber(totalScore.get("fullScore")), x, currentRowY, colWidths[6], rowHeight, true);

            currentY = currentRowY + rowHeight + 20;
        }

        private void drawTableCell(String text, int x, int y, int width, int height, boolean header) {
            currentGraphics.setColor(header ? new Color(241, 245, 249) : Color.WHITE);
            currentGraphics.fillRect(x, y, width, height);
            currentGraphics.setColor(new Color(203, 213, 225));
            currentGraphics.drawRect(x, y, width, height);
            currentGraphics.setFont(new Font("Microsoft YaHei", header ? Font.BOLD : Font.PLAIN, 22));
            currentGraphics.setColor(new Color(30, 41, 59));
            currentGraphics.drawString(text, x + 12, y + 32);
        }

        public void drawImage(BufferedImage image, int maxWidth, int maxHeight) {
            if (image == null) return;
            float scale = Math.min((float) maxWidth / image.getWidth(), (float) maxHeight / image.getHeight());
            scale = Math.min(scale, 1.0f);
            int drawWidth = Math.max(1, Math.round(image.getWidth() * scale));
            int drawHeight = Math.max(1, Math.round(image.getHeight() * scale));
            checkSpace(drawHeight + 16);
            int x = PAGE_MARGIN + (contentWidth - drawWidth) / 2;
            currentGraphics.drawImage(image, x, currentY, drawWidth, drawHeight, null);
            currentY += drawHeight + 16;
        }

        public void addSpace(int space) {
            currentY += space;
            checkSpace(0);
        }

        private void checkSpace(int needed) {
            if (currentY + needed > PAGE_HEIGHT - PAGE_MARGIN) {
                createNewPage();
            }
        }

        private int drawWrappedText(Graphics2D g, String text, int x, int y, int maxWidth, Font font, Color color, int lineHeight) {
            g.setFont(font);
            g.setColor(color);
            FontMetrics metrics = g.getFontMetrics(font);
            int currentYPos = y;
            StringBuilder line = new StringBuilder();
            for (char c : text.toCharArray()) {
                if (metrics.stringWidth(line.toString() + c) > maxWidth) {
                    g.drawString(line.toString(), x, currentYPos + metrics.getAscent());
                    currentYPos += lineHeight;
                    line = new StringBuilder();
                    if (currentYPos > PAGE_HEIGHT - PAGE_MARGIN) {
                        // This shouldn't happen if checkSpace is used correctly, but for safety:
                        appendCurrentPage();
                        createNewPage();
                        currentYPos = PAGE_MARGIN;
                        g.setFont(font);
                        g.setColor(color);
                    }
                }
                line.append(c);
            }
            g.drawString(line.toString(), x, currentYPos + metrics.getAscent());
            return currentYPos + lineHeight;
        }
    }

    private Optional<SysStudent> getBoundStudent(Long uid) {
        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) {
            return Optional.empty();
        }
        return studentRepository.findById(bindings.get(0).getStudentId());
    }

    private ExamClass resolveExamClass(String projectId, SysStudent student) {
        return examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(projectId).stream()
                .filter(item ->
                        (StringUtils.hasText(item.getSourceClassId()) && item.getSourceClassId().equals(student.getClassId()))
                                || (safeEquals(item.getSchoolId(), student.getSchoolId())
                                && safeEquals(item.getGrade(), student.getGrade())
                                && safeEquals(item.getClassName(), student.getClassName())))
                .findFirst()
                .orElse(null);
    }

    private ProjectContext buildProjectContext(ExamProject project, ExamClass currentClass, SysStudent student) {
        List<ExamClass> projectClasses = examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(project.getId());
        if (projectClasses.isEmpty()) {
            return ProjectContext.fail("考试项目下暂无班级数据");
        }

        List<ExamSubject> projectSubjects = examSubjectRepository.findByProjectIdOrderBySubjectNameAsc(project.getId());
        if (projectSubjects.isEmpty()) {
            return ProjectContext.fail("考试项目下暂无科目数据");
        }

        List<String> subjectIds = projectSubjects.stream().map(ExamSubject::getId).toList();
        List<ExamStudentScore> enteredScores = examStudentScoreRepository.findBySubjectIdIn(subjectIds).stream()
                .filter(this::isEnteredScore)
                .toList();

        Map<String, ExamClass> classMap = projectClasses.stream()
                .collect(Collectors.toMap(ExamClass::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        Map<String, ExamSubject> subjectMap = projectSubjects.stream()
                .collect(Collectors.toMap(ExamSubject::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        Map<String, ExamSubject> currentSubjectMap = projectSubjects.stream()
                .collect(Collectors.toMap(ExamSubject::getSubjectName, item -> item, (a, b) -> a, LinkedHashMap::new));

        List<String> sourceClassIds = projectClasses.stream().map(ExamClass::getSourceClassId).filter(StringUtils::hasText).toList();
        Map<String, ExamClass> studentClassMap = (sourceClassIds.isEmpty() ? Collections.<SysStudent>emptyList() : studentRepository.findByClassIdIn(sourceClassIds)).stream()
                .filter(item -> StringUtils.hasText(item.getStudentNo()))
                .collect(Collectors.toMap(
                        SysStudent::getStudentNo,
                        item -> projectClasses.stream()
                                .filter(examClass -> item.getClassId().equals(examClass.getSourceClassId()))
                                .findFirst()
                                .orElse(null),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Double> fullScoreMap = parseBenchmarks(project.getSubjectBenchmarks());
        Map<String, List<Map<String, Object>>> paperLayoutMap = parsePaperLayouts(projectSubjects);
        List<StudentTotalRow> totals = buildStudentTotals(enteredScores, studentClassMap);
        if (totals.isEmpty()) {
            return ProjectContext.fail("考试项目下暂无已录入成绩");
        }

        return ProjectContext.success(project, student, currentClass, classMap, currentSubjectMap, subjectMap, enteredScores, fullScoreMap, paperLayoutMap, totals);
    }

    private List<StudentTotalRow> buildStudentTotals(List<ExamStudentScore> scores, Map<String, ExamClass> studentClassMap) {
        Map<String, StudentTotalAccumulator> accumulatorMap = new LinkedHashMap<>();
        for (ExamStudentScore score : scores) {
            ExamClass examClass = studentClassMap.get(score.getStudentNo());
            if (examClass == null) continue;
            StudentTotalAccumulator accumulator = accumulatorMap.computeIfAbsent(score.getStudentNo(), key ->
                    new StudentTotalAccumulator(score.getStudentNo(), score.getStudentName(), examClass.getId(), examClass.getSchoolId(), examClass.getGrade())
            );
            accumulator.totalScore += nullableDouble(score.getTotalScore());
        }
        return accumulatorMap.values().stream().map(StudentTotalAccumulator::toRow).toList();
    }

    private Map<String, Object> buildSourceSnapshot(ProjectContext context, Map<String, Object> analysisData) {
        StudentTotalRow currentTotal = context.studentTotals().stream()
                .filter(item -> item.studentNo().equals(context.student().getStudentNo()))
                .findFirst()
                .orElse(new StudentTotalRow(context.student().getStudentNo(), context.student().getName(), context.currentClass().getId(), context.currentClass().getSchoolId(), context.currentClass().getGrade(), 0D));

        List<Map<String, Object>> subjectStats = listMap(analysisData.get("subjectStats"));
        List<Map<String, Object>> wrongQuestions = listMap(analysisData.get("wrongQuestions"));

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("exam", Map.of(
                "projectId", context.project().getId(),
                "projectName", context.project().getName(),
                "studentNo", context.student().getStudentNo(),
                "studentName", context.student().getName(),
                "schoolName", context.currentClass().getSchool(),
                "grade", context.currentClass().getGrade(),
                "className", context.currentClass().getClassName()
        ));
        snapshot.put("totalScore", buildTotalComparison(context, currentTotal));
        snapshot.put("subjects", buildSubjectComparisons(context, subjectStats));
        snapshot.put("wrongQuestions", buildWrongQuestionPromptRows(context, wrongQuestions));
        snapshot.put("reportLimit", Map.of(
                "summaryOnly", true,
                "pushWrongQuestionsOnly", true,
                "disallowScheduleAdvice", true,
                "disallowResourceRecommendation", true
        ));
        return snapshot;
    }

    private Map<String, Object> buildTotalComparison(ProjectContext context, StudentTotalRow currentTotal) {
        List<StudentTotalRow> totals = context.studentTotals();
        List<StudentTotalRow> classRows = filterTotals(totals, item -> item.classId().equals(context.currentClass().getId()));
        List<StudentTotalRow> schoolRows = filterTotals(totals, item -> item.schoolId().equals(context.currentClass().getSchoolId()));
        List<StudentTotalRow> gradeRows = filterTotals(totals, item -> item.grade().equals(context.currentClass().getGrade()));

        double totalFullScore = context.currentSubjectMap().keySet().stream()
                .mapToDouble(subject -> context.fullScoreMap().getOrDefault(subject, 0D))
                .sum();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("studentScore", round(currentTotal.totalScore()));
        data.put("fullScore", round(totalFullScore));
        data.put("projectAverage", round(average(totals.stream().map(StudentTotalRow::totalScore).toList())));
        data.put("schoolAverage", round(average(schoolRows.stream().map(StudentTotalRow::totalScore).toList())));
        data.put("gradeAverage", round(average(gradeRows.stream().map(StudentTotalRow::totalScore).toList())));
        data.put("classAverage", round(average(classRows.stream().map(StudentTotalRow::totalScore).toList())));
        data.put("projectRank", rankOf(totals, currentTotal.studentNo()));
        data.put("schoolRank", rankOf(schoolRows, currentTotal.studentNo()));
        data.put("gradeRank", rankOf(gradeRows, currentTotal.studentNo()));
        data.put("classRank", rankOf(classRows, currentTotal.studentNo()));
        data.put("projectCount", totals.size());
        data.put("schoolCount", schoolRows.size());
        data.put("gradeCount", gradeRows.size());
        data.put("classCount", classRows.size());
        return data;
    }

    private List<Map<String, Object>> buildSubjectComparisons(ProjectContext context, List<Map<String, Object>> subjectStats) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> stat : subjectStats) {
            String subjectName = asString(stat.get("subject"));
            ExamSubject currentSubject = context.currentSubjectMap().get(subjectName);
            if (currentSubject == null) continue;

            List<ExamStudentScore> projectScores = subjectScoresByGroup(context, subjectName, item -> true);
            List<ExamStudentScore> schoolScores = subjectScoresByGroup(context, subjectName, item -> item.schoolId().equals(context.currentClass().getSchoolId()));
            List<ExamStudentScore> gradeScores = subjectScoresByGroup(context, subjectName, item -> item.grade().equals(context.currentClass().getGrade()));
            List<ExamStudentScore> classScores = context.enteredScores().stream()
                    .filter(item -> currentSubject.getId().equals(item.getSubjectId()))
                    .toList();

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("subjectName", subjectName);
            row.put("score", round(asDouble(stat.get("score"))));
            row.put("fullScore", round(asDouble(stat.get("fullScore"))));
            row.put("classAverage", round(average(classScores.stream().map(ExamStudentScore::getTotalScore).toList())));
            row.put("schoolAverage", round(average(schoolScores.stream().map(ExamStudentScore::getTotalScore).toList())));
            row.put("gradeAverage", round(average(gradeScores.stream().map(ExamStudentScore::getTotalScore).toList())));
            row.put("projectAverage", round(average(projectScores.stream().map(ExamStudentScore::getTotalScore).toList())));
            row.put("classRank", rankOfScores(classScores, context.student().getStudentNo()));
            row.put("schoolRank", rankOfScores(schoolScores, context.student().getStudentNo()));
            row.put("gradeRank", rankOfScores(gradeScores, context.student().getStudentNo()));
            row.put("projectRank", rankOfScores(projectScores, context.student().getStudentNo()));
            row.put("classCount", classScores.size());
            row.put("schoolCount", schoolScores.size());
            row.put("gradeCount", gradeScores.size());
            row.put("projectCount", projectScores.size());
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> buildWrongQuestionPromptRows(ProjectContext context, List<Map<String, Object>> wrongQuestions) {
        Map<String, Map<String, Object>> layoutBySubjectAndQuestion = new HashMap<>();
        context.paperLayoutMap().forEach((subjectName, layoutRows) -> layoutRows.forEach(row -> {
            String key = subjectName + "#" + asString(row.get("questionNo"));
            layoutBySubjectAndQuestion.put(key, row);
        }));

        return wrongQuestions.stream()
                .sorted(Comparator.comparingDouble(item -> -asDouble(item.get("lostScore"))))
                .limit(10)
                .map(item -> {
                    String subjectName = asString(item.get("subject"));
                    String questionNo = "第" + asString(item.get("questionNo")) + "题";
                    Map<String, Object> layoutRow = layoutBySubjectAndQuestion.get(subjectName + "#" + questionNo);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("subjectName", subjectName);
                    row.put("questionNo", questionNo);
                    row.put("studentScore", round(asDouble(item.get("score"))));
                    row.put("fullScore", round(asDouble(item.get("fullScore"))));
                    row.put("lostScore", round(asDouble(item.get("lostScore"))));
                    row.put("classAverage", round(asDouble(item.get("avgScore"))));
                    row.put("schoolAverage", round(asDouble(item.get("schoolAvg"))));
                    row.put("knowledgePoint", StringUtils.hasText(asString(item.get("knowledgePoint")))
                            ? asString(item.get("knowledgePoint"))
                            : asString(layoutRow == null ? null : layoutRow.get("knowledgePoint")));
                    row.put("questionType", asString(layoutRow == null ? null : layoutRow.get("questionType")));
                    row.put("explanation", asString(item.get("explanation")));
                    return row;
                })
                .toList();
    }

    private List<ExamStudentScore> subjectScoresByGroup(ProjectContext context, String subjectName, java.util.function.Predicate<StudentTotalRow> predicate) {
        ExamSubject subject = context.currentSubjectMap().get(subjectName);
        if (subject == null) return Collections.emptyList();
        List<String> studentNos = context.studentTotals().stream()
                .filter(predicate)
                .map(StudentTotalRow::studentNo)
                .toList();
        return context.enteredScores().stream()
                .filter(item -> subject.getId().equals(item.getSubjectId()) && studentNos.contains(item.getStudentNo()))
                .toList();
    }

    private Map<String, Object> requestQwenReport(Map<String, Object> sourceSnapshot) {
        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", resolveQwenModel());
            requestBody.put("enable_thinking", false);
            requestBody.put("temperature", 0.2);
            requestBody.put("response_format", Map.of("type", "json_object"));
            requestBody.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", """
                                    你是一名严谨的中小学考试成绩分析助手。
                                    你只能根据输入数据总结当前考试的强势点、薄弱点和错题推送，不能输出学习计划、课程推荐、自习室、广告内容。
                                    错题推送只能从 wrongQuestions 数组中选择，禁止虚构不存在的题目。
                                    你必须严格输出合法 JSON，结构固定为：
                                    {
                                      "summary": {
                                        "overallComment": "string",
                                        "strengths": ["string"],
                                        "weaknesses": ["string"],
                                        "focusPoints": ["string"]
                                      },
                                      "subjectInsights": [
                                        {
                                          "subjectName": "string",
                                          "strength": "string",
                                          "weakness": "string",
                                          "comparison": "string"
                                        }
                                      ],
                                      "wrongQuestionPushes": [
                                        {
                                          "subjectName": "string",
                                          "questionNo": "string",
                                          "knowledgePoint": "string",
                                          "reason": "string",
                                          "suggestion": "string"
                                        }
                                      ]
                                    }
                                    """
                    ),
                    Map.of(
                            "role", "user",
                            "content", "请根据以下考试快照生成 AI 成绩报告，严格输出 JSON，不要输出 Markdown：\n" + writeJson(sourceSnapshot)
                    )
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(globalConfigProperties.getQwenChatUrl()))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + globalConfigProperties.getQwenApiKey().trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(writeJson(requestBody), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("大模型调用失败，HTTP状态码：" + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || !StringUtils.hasText(contentNode.asText())) {
                throw new IllegalStateException("大模型未返回有效的报告内容");
            }

            Map<String, Object> report = readJsonMap(contentNode.asText().trim());
            return normalizeAiReport(report);
        } catch (Exception e) {
            throw new IllegalStateException("生成 AI 成绩报告失败：" + e.getMessage(), e);
        }
    }

    private Map<String, Object> normalizeAiReport(Map<String, Object> raw) {
        Map<String, Object> report = new LinkedHashMap<>();
        Map<String, Object> summary = raw == null ? Collections.emptyMap() : map(raw.get("summary"));
        report.put("summary", Map.of(
                "overallComment", asString(summary.get("overallComment")),
                "strengths", stringList(summary.get("strengths")),
                "weaknesses", stringList(summary.get("weaknesses")),
                "focusPoints", stringList(summary.get("focusPoints"))
        ));

        List<Map<String, Object>> subjectInsights = listMap(raw == null ? null : raw.get("subjectInsights")).stream()
                .map(item -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("subjectName", asString(item.get("subjectName")));
                    row.put("strength", asString(item.get("strength")));
                    row.put("weakness", asString(item.get("weakness")));
                    row.put("comparison", asString(item.get("comparison")));
                    return row;
                })
                .toList();
        report.put("subjectInsights", subjectInsights);

        List<Map<String, Object>> wrongPushes = listMap(raw == null ? null : raw.get("wrongQuestionPushes")).stream()
                .map(item -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("subjectName", asString(item.get("subjectName")));
                    row.put("questionNo", asString(item.get("questionNo")));
                    row.put("knowledgePoint", asString(item.get("knowledgePoint")));
                    row.put("reason", asString(item.get("reason")));
                    row.put("suggestion", asString(item.get("suggestion")));
                    return row;
                })
                .toList();
        report.put("wrongQuestionPushes", wrongPushes);
        return report;
    }

    private Map<String, Object> buildClientPayload(Map<String, Object> reportContent, boolean cached, String modelName, LocalDateTime generatedAt) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("cached", cached);
        data.put("model", StringUtils.hasText(modelName) ? modelName : resolveQwenModel());
        data.put("generatedAt", generatedAt == null ? "" : generatedAt.format(DATE_TIME_FORMATTER));
        data.put("summary", map(reportContent.get("summary")));
        data.put("subjectInsights", listMap(reportContent.get("subjectInsights")));
        data.put("wrongQuestionPushes", listMap(reportContent.get("wrongQuestionPushes")));
        return data;
    }

    private BufferedImage buildSubjectBarChart(List<Map<String, Object>> subjectRows) {
        int width = 1000;
        int height = 320;
        int left = 90;
        int right = 40;
        int top = 30;
        int bottom = 70;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, width, height);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setColor(new Color(226, 232, 240));
            g.drawLine(left, height - bottom, width - right, height - bottom);
            g.drawLine(left, top, left, height - bottom);

            Font font = new Font("Microsoft YaHei", Font.PLAIN, 16);
            g.setFont(font);
            double maxRate = 100D;
            int chartWidth = width - left - right;
            int chartHeight = height - top - bottom;
            int groupWidth = Math.max(chartWidth / Math.max(subjectRows.size(), 1), 80);
            int barWidth = 18;

            for (int i = 0; i <= 5; i++) {
                int y = top + Math.round(chartHeight * i / 5f);
                g.setColor(new Color(241, 245, 249));
                g.drawLine(left, y, width - right, y);
                g.setColor(new Color(100, 116, 139));
                int value = (int) Math.round(maxRate - maxRate * i / 5f);
                g.drawString(value + "%", 32, y + 6);
            }

            for (int index = 0; index < subjectRows.size(); index++) {
                Map<String, Object> row = subjectRows.get(index);
                double fullScore = Math.max(asDouble(row.get("fullScore")), 1D);
                double[] rates = {
                        asDouble(row.get("score")) / fullScore * 100D,
                        asDouble(row.get("classAverage")) / fullScore * 100D,
                        asDouble(row.get("gradeAverage")) / fullScore * 100D,
                        asDouble(row.get("schoolAverage")) / fullScore * 100D,
                        asDouble(row.get("projectAverage")) / fullScore * 100D
                };
                Color[] colors = {
                        new Color(239, 68, 68),
                        new Color(37, 99, 235),
                        new Color(16, 185, 129),
                        new Color(249, 115, 22),
                        new Color(168, 85, 247)
                };
                int groupX = left + index * groupWidth + 6;
                int baseline = height - bottom;
                for (int barIndex = 0; barIndex < rates.length; barIndex++) {
                    int barHeight = (int) Math.round(chartHeight * rates[barIndex] / maxRate);
                    int x = groupX + barIndex * (barWidth + 4);
                    int y = baseline - barHeight;
                    g.setColor(colors[barIndex]);
                    g.fillRoundRect(x, y, barWidth, barHeight, 6, 6);
                }
                g.setColor(new Color(30, 41, 59));
                g.drawString(asString(row.get("subjectName")), groupX - 2, height - 28);
            }

            String[] legends = { "个人成绩", "班级平均", "年级平均", "校平均", "联考平均" };
            Color[] legendColors = {
                    new Color(239, 68, 68),
                    new Color(37, 99, 235),
                    new Color(16, 185, 129),
                    new Color(249, 115, 22),
                    new Color(168, 85, 247)
            };
            int legendX = 80;
            for (int index = 0; index < legends.length; index++) {
                g.setColor(legendColors[index]);
                g.fillRoundRect(legendX, 12, 16, 10, 4, 4);
                g.setColor(new Color(51, 65, 85));
                g.drawString(legends[index], legendX + 22, 22);
                legendX += 170;
            }
        } finally {
            g.dispose();
        }
        return image;
    }

    private List<String> buildOneScoreFourRateLines(Map<String, Object> totalScore, List<Map<String, Object>> subjectRows) {
        if (subjectRows.isEmpty()) {
            return List.of("暂无学科成绩数据，无法生成一分四率分析。");
        }
        long passCount = subjectRows.stream().filter(item -> scoreRate(item) >= 0.6D).count();
        long excellentCount = subjectRows.stream().filter(item -> scoreRate(item) >= 0.8D).count();
        long goodCount = subjectRows.stream().filter(item -> scoreRate(item) >= 0.7D).count();
        long lowCount = subjectRows.stream().filter(item -> scoreRate(item) < 0.6D).count();
        int total = subjectRows.size();
        return List.of(
                String.format("平均分：个人总分 %.1f 分，班级平均 %.1f 分，年级平均 %.1f 分，校平均 %.1f 分，联考平均 %.1f 分。",
                        asDouble(totalScore.get("studentScore")), asDouble(totalScore.get("classAverage")), asDouble(totalScore.get("gradeAverage")),
                        asDouble(totalScore.get("schoolAverage")), asDouble(totalScore.get("projectAverage"))),
                String.format("及格率：共有 %d/%d 科达到及格线，及格率 %.1f%%。", passCount, total, ratioPercent(passCount, total)),
                String.format("优秀率：共有 %d/%d 科达到优秀标准，优秀率 %.1f%%。", excellentCount, total, ratioPercent(excellentCount, total)),
                String.format("良好率：共有 %d/%d 科达到良好标准，良好率 %.1f%%。", goodCount, total, ratioPercent(goodCount, total)),
                String.format("低分率：共有 %d/%d 科低于及格线，低分率 %.1f%%。", lowCount, total, ratioPercent(lowCount, total))
        );
    }

    private List<String> buildBorderlineLines(Map<String, Object> totalScore) {
        return List.of(
                String.format("当前总分 %.1f 分，班级排名第 %d/%d，年级排名第 %d/%d。", asDouble(totalScore.get("studentScore")),
                        (int) asDouble(totalScore.get("classRank")), (int) asDouble(totalScore.get("classCount")),
                        (int) asDouble(totalScore.get("gradeRank")), (int) asDouble(totalScore.get("gradeCount"))),
                "若想进一步提升排名，建议优先补强明显低于平均线的学科，并重点回看高频失分题。",
                "当前成绩仍有明显提升空间，需通过阶段性复盘和专题训练逐步突破。"
        );
    }

    private List<String> buildSubjectPerformanceLines(List<Map<String, Object>> subjectRows) {
        List<String> lines = new ArrayList<>();
        List<String> strong = new ArrayList<>();
        List<String> stable = new ArrayList<>();
        List<String> weak = new ArrayList<>();
        List<String> severe = new ArrayList<>();
        for (Map<String, Object> row : subjectRows) {
            double diff = scoreRate(row) - averageRate(row, "gradeAverage");
            String subject = asString(row.get("subjectName"));
            if (diff >= 0.08D) strong.add(subject);
            else if (diff >= 0D) stable.add(subject);
            else if (diff <= -0.2D) severe.add(subject);
            else weak.add(subject);
        }
        if (!strong.isEmpty()) lines.add("优势学科：" + String.join("、", strong) + "，得分率高于年级平均，基础扎实，具备继续冲高的空间。");
        if (!stable.isEmpty()) lines.add("平稳学科：" + String.join("、", stable) + "，发挥较稳，只需持续巩固与查漏补缺。");
        if (!weak.isEmpty()) lines.add("薄弱学科：" + String.join("、", weak) + "，得分率低于年级平均，需尽快定位失分原因。");
        if (!severe.isEmpty()) lines.add("严重薄弱学科：" + String.join("、", severe) + "，已成为拉低总分的核心因素，应优先投入时间补强。");
        return lines.isEmpty() ? List.of("当前学科表现整体均衡，建议继续保持稳定输出。") : lines;
    }

    private List<String> buildKnowledgePointStrengthLines(Map<String, Object> reportData, List<Map<String, Object>> subjectRows) {
        List<String> strengths = stringList(map(reportData.get("summary")).get("strengths"));
        if (!strengths.isEmpty()) return strengths;
        return subjectRows.stream()
                .sorted(Comparator.comparingDouble(this::scoreRate).reversed())
                .limit(3)
                .map(item -> asString(item.get("subjectName")) + "当前知识点掌握较稳，可保持训练频率，避免优势回落。")
                .toList();
    }

    private List<String> buildKnowledgePointWeaknessLines(Map<String, Object> reportData, Map<String, Object> sourceSnapshot) {
        List<Map<String, Object>> wrongQuestions = listMap(sourceSnapshot.get("wrongQuestions"));
        Map<String, Long> grouped = wrongQuestions.stream()
                .map(item -> asString(item.get("knowledgePoint")).trim())
                .filter(StringUtils::hasText)
                .collect(Collectors.groupingBy(item -> item, LinkedHashMap::new, Collectors.counting()));
        if (!grouped.isEmpty()) {
            return grouped.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(entry -> entry.getKey() + "：高频失分知识点，建议优先做专题复盘与同类题训练。")
                    .toList();
        }
        return listMap(reportData.get("wrongQuestionPushes")).stream()
                .map(item -> asString(item.get("knowledgePoint")).trim())
                .filter(StringUtils::hasText)
                .distinct()
                .map(item -> item + "：建议结合错题推送做强化巩固。")
                .toList();
    }

    private Map<String, List<String>> buildStudyPlanSections(Map<String, Object> reportData, List<Map<String, Object>> subjectRows, Map<String, Object> totalScore) {
        List<String> weakSubjects = subjectRows.stream()
                .sorted(Comparator.comparingDouble(this::scoreRate))
                .limit(2)
                .map(item -> asString(item.get("subjectName")))
                .toList();
        Map<String, List<String>> sections = new LinkedHashMap<>();
        sections.put("1. 短期计划（1-2周）：补齐基础漏洞", List.of(
                "主攻 " + String.join("、", weakSubjects.isEmpty() ? List.of("薄弱学科") : weakSubjects) + " 的基础知识点，完成课本梳理和错题回顾。",
                "每天优先解决基础题和中档题的稳定性问题，减少会做但失分的情况。",
                "目标：缩小与年级平均的差距，提升整体得分稳定性。"
        ));
        sections.put("2. 中期计划（3-4周）：专项突破提分", List.of(
                "围绕高频失分题型做专项训练，总结通用解题步骤和答题规范。",
                "结合 AI 推送的重点关注内容，逐步补齐薄弱知识点。",
                "目标：带动弱势学科提升，促进总分持续回升。"
        ));
        sections.put("3. 长期计划（阶段冲刺）：稳定优势结构", List.of(
                "保持优势学科训练频率，避免在补弱过程中出现强项回落。",
                "每周至少完成一次整卷限时训练，重点观察做题节奏和时间分配。",
                String.format("目标：在当前 %.1f 分基础上继续稳步上升，逐步冲击更高名次。", asDouble(totalScore.get("studentScore")))
        ));
        return sections;
    }

    private List<String> buildFinalSummaryLines(Map<String, Object> reportData, List<Map<String, Object>> subjectRows, Map<String, Object> totalScore) {
        List<String> lines = new ArrayList<>();
        String overallComment = asString(map(reportData.get("summary")).get("overallComment"));
        if (StringUtils.hasText(overallComment)) lines.add(overallComment);
        List<String> weakSubjects = subjectRows.stream()
                .filter(item -> scoreRate(item) < averageRate(item, "gradeAverage"))
                .map(item -> asString(item.get("subjectName")))
                .toList();
        if (!weakSubjects.isEmpty()) {
            lines.add("当前需要重点补强的学科主要集中在：" + String.join("、", weakSubjects) + "。");
        }
        lines.add(String.format("只要围绕错题知识点持续复盘，并执行分阶段提升计划，当前 %.1f 分仍有进一步提升空间。", asDouble(totalScore.get("studentScore"))));
        return lines;
    }

    private BufferedImage loadTeacherGuideImage() {
        try {
            ClassPathResource resource = new ClassPathResource("static/resource/recommend_tutor.png");
            return resource.exists() ? javax.imageio.ImageIO.read(resource.getInputStream()) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private double scoreRate(Map<String, Object> row) {
        double fullScore = Math.max(asDouble(row.get("fullScore")), 1D);
        return asDouble(row.get("score")) / fullScore;
    }

    private double averageRate(Map<String, Object> row, String key) {
        double fullScore = Math.max(asDouble(row.get("fullScore")), 1D);
        return asDouble(row.get(key)) / fullScore;
    }

    private double ratioPercent(long count, int total) {
        return total <= 0 ? 0D : Math.round(count * 1000D / total) / 10D;
    }

    private String formatNumber(Object value) {
        double v = asDouble(value);
        return Math.abs(v - Math.round(v)) < 0.01 ? String.valueOf((int) Math.round(v)) : String.format("%.1f", v);
    }

    private Map<String, Double> parseBenchmarks(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try {
            Map<String, Object> raw = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            Map<String, Double> result = new LinkedHashMap<>();
            raw.forEach((key, value) -> {
                if (value instanceof Map<?, ?> nestedMap) {
                    Object totalScore = nestedMap.get("totalScore");
                    if (totalScore == null) {
                        totalScore = nestedMap.get("fullScore");
                    }
                    result.put(key, asDouble(totalScore));
                    return;
                }
                result.put(key, asDouble(value));
            });
            return result;
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private Map<String, List<Map<String, Object>>> parsePaperLayouts(List<ExamSubject> subjects) {
        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for (ExamSubject subject : subjects) {
            List<Map<String, Object>> rows = listMap(readJsonValue(subject.getAnswersLayouts()));
            if (rows.isEmpty()) {
                rows = listMap(readJsonValue(subject.getPaperLayouts()));
            }
            result.put(subject.getSubjectName(), rows);
        }
        return result;
    }

    private Map<String, Object> map(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            Map<String, Object> result = new LinkedHashMap<>();
            rawMap.forEach((key, val) -> result.put(String.valueOf(key), val));
            return result;
        }
        return Collections.emptyMap();
    }

    private Object readJsonValue(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> listMap(Object value) {
        if (!(value instanceof Collection<?> collection)) return Collections.emptyList();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : collection) {
            rows.add(map(item));
        }
        return rows;
    }

    private Map<String, Object> readJsonMap(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof Collection<?> collection)) return Collections.emptyList();
        return collection.stream().map(this::asString).filter(StringUtils::hasText).toList();
    }

    private String resolveQwenModel() {
        return StringUtils.hasText(globalConfigProperties.getQwenModel())
                ? globalConfigProperties.getQwenModel().trim()
                : "qwen3.6-plus";
    }

    private String resolvePromptVersion() {
        return StringUtils.hasText(globalConfigProperties.getQwenPromptVersion())
                ? globalConfigProperties.getQwenPromptVersion().trim()
                : "qwen-score-report-v1";
    }

    private List<StudentTotalRow> filterTotals(List<StudentTotalRow> rows, java.util.function.Predicate<StudentTotalRow> predicate) {
        return rows.stream().filter(predicate).toList();
    }

    private int rankOf(List<StudentTotalRow> rows, String studentNo) {
        List<StudentTotalRow> sorted = rows.stream()
                .sorted(Comparator.comparingDouble(StudentTotalRow::totalScore).reversed())
                .toList();
        for (int i = 0; i < sorted.size(); i++) {
            if (studentNo.equals(sorted.get(i).studentNo())) {
                return i + 1;
            }
        }
        return 0;
    }

    private int rankOfScores(List<ExamStudentScore> scores, String studentNo) {
        List<ExamStudentScore> sorted = scores.stream()
                .sorted(Comparator.comparingDouble(item -> -nullableDouble(item.getTotalScore())))
                .toList();
        for (int i = 0; i < sorted.size(); i++) {
            if (studentNo.equals(sorted.get(i).getStudentNo())) {
                return i + 1;
            }
        }
        return 0;
    }

    private double average(List<Double> values) {
        if (values == null || values.isEmpty()) return 0D;
        return values.stream().filter(item -> item != null).mapToDouble(Double::doubleValue).average().orElse(0D);
    }

    private boolean safeEquals(String a, String b) {
        return StringUtils.hasText(a) && StringUtils.hasText(b) && a.trim().equals(b.trim());
    }

    private boolean isEnteredScore(ExamStudentScore score) {
        return score != null && Boolean.TRUE.equals(score.getScoreEntered()) && score.getTotalScore() != null;
    }

    private double nullableDouble(Double value) {
        return value == null ? 0D : value;
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private double asDouble(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        if (value instanceof String text && StringUtils.hasText(text)) {
            try {
                return Double.parseDouble(text);
            } catch (Exception ignored) {
                return 0D;
            }
        }
        return 0D;
    }

    private double round(double value) {
        return Math.round(value * 10D) / 10D;
    }

    private record ProjectContext(
            boolean ok,
            String message,
            ExamProject project,
            SysStudent student,
            ExamClass currentClass,
            Map<String, ExamClass> classMap,
            Map<String, ExamSubject> currentSubjectMap,
            Map<String, ExamSubject> subjectMap,
            List<ExamStudentScore> enteredScores,
            Map<String, Double> fullScoreMap,
            Map<String, List<Map<String, Object>>> paperLayoutMap,
            List<StudentTotalRow> studentTotals
    ) {
        private static ProjectContext success(
                ExamProject project,
                SysStudent student,
                ExamClass currentClass,
                Map<String, ExamClass> classMap,
                Map<String, ExamSubject> currentSubjectMap,
                Map<String, ExamSubject> subjectMap,
                List<ExamStudentScore> enteredScores,
                Map<String, Double> fullScoreMap,
                Map<String, List<Map<String, Object>>> paperLayoutMap,
                List<StudentTotalRow> studentTotals
        ) {
            return new ProjectContext(true, "", project, student, currentClass, classMap, currentSubjectMap, subjectMap, enteredScores, fullScoreMap, paperLayoutMap, studentTotals);
        }

        private static ProjectContext fail(String message) {
            return new ProjectContext(false, message, null, null, null, Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyList());
        }
    }

    private static final class StudentTotalAccumulator {
        private final String studentNo;
        private final String studentName;
        private final String classId;
        private final String schoolId;
        private final String grade;
        private double totalScore;

        private StudentTotalAccumulator(String studentNo, String studentName, String classId, String schoolId, String grade) {
            this.studentNo = studentNo;
            this.studentName = studentName;
            this.classId = classId;
            this.schoolId = schoolId;
            this.grade = grade;
        }

        private StudentTotalRow toRow() {
            return new StudentTotalRow(studentNo, studentName, classId, schoolId, grade, totalScore);
        }
    }

    private record StudentTotalRow(
            String studentNo,
            String studentName,
            String classId,
            String schoolId,
            String grade,
            double totalScore
    ) {}
}
