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

        try (PDDocument document = new PDDocument()) {
            PdfRenderContext context = new PdfRenderContext(document);
            
            // Title
            context.drawTitle("AI 成绩分析报告", 48, true);
            context.drawText(project.getName(), 24, false, new Color(100, 116, 139));
            context.drawText("学生：" + studentOpt.get().getName() + " (" + studentOpt.get().getStudentNo() + ")", 24, false, new Color(100, 116, 139));
            context.drawText("生成时间：" + data.get("generatedAt"), 20, false, new Color(148, 163, 184));
            context.addSpace(40);

            // 1. Overall Summary
            Map<String, Object> summary = map(data.get("summary"));
            context.drawSectionTitle("一、总体诊断");
            context.drawText(asString(summary.get("overallComment")), 26, false, new Color(51, 65, 85));
            context.addSpace(20);
            
            context.drawSubTitle("强势点");
            context.drawBullets(stringList(summary.get("strengths")), new Color(22, 163, 74));
            
            context.drawSubTitle("薄弱点");
            context.drawBullets(stringList(summary.get("weaknesses")), new Color(220, 38, 38));
            
            context.drawSubTitle("重点关注");
            context.drawBullets(stringList(summary.get("focusPoints")), new Color(37, 99, 235));
            context.addSpace(40);

            // 2. Subject Insights
            context.drawSectionTitle("二、学科能力分析");
            List<Map<String, Object>> subjectInsights = listMap(data.get("subjectInsights"));
            for (Map<String, Object> insight : subjectInsights) {
                context.drawSubTitle(asString(insight.get("subjectName")));
                context.drawLabelText("优势", asString(insight.get("strength")));
                context.drawLabelText("短板", asString(insight.get("weakness")));
                context.drawLabelText("对比", asString(insight.get("comparison")));
                context.addSpace(15);
            }
            context.addSpace(40);

            // 3. Wrong Question Pushes
            context.drawSectionTitle("三、错题与薄弱点分析");
            List<Map<String, Object>> pushes = listMap(data.get("wrongQuestionPushes"));
            for (Map<String, Object> push : pushes) {
                context.drawSubTitle(asString(push.get("subjectName")) + " - " + asString(push.get("questionNo")));
                if (StringUtils.hasText(asString(push.get("knowledgePoint")))) {
                    context.drawLabelText("知识点", asString(push.get("knowledgePoint")));
                }
                context.drawLabelText("原因", asString(push.get("reason")));
                context.drawLabelText("建议", asString(push.get("suggestion")));
                context.addSpace(15);
            }

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
