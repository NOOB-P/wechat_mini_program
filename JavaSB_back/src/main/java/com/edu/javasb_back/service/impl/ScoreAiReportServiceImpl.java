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
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

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

    @Autowired
    private com.edu.javasb_back.repository.SysAccountRepository sysAccountRepository;

    @Override
    @Transactional
    public Result<Map<String, Object>> getExamAiReport(Long uid, String examId, boolean refresh) {
        if (uid == null) {
            return Result.error("请先登录");
        }
        
        Optional<com.edu.javasb_back.model.entity.SysAccount> accountOpt = sysAccountRepository.findById(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }
        
        com.edu.javasb_back.model.entity.SysAccount account = accountOpt.get();
        com.edu.javasb_back.utils.VipTypeUtils.normalizeAccountVipType(account);
        sysAccountRepository.save(account);

        if (!com.edu.javasb_back.utils.VipTypeUtils.isVip(account.getVipType()) && !com.edu.javasb_back.utils.VipTypeUtils.isSvip(account.getVipType())) {
            return Result.error(403, "此功能为 VIP/SVIP 专属，请先升级会员");
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
        
        // 自动刷新逻辑：24小时自动重新生成
        boolean shouldAutoRefresh = false;
        if (cached.isPresent()) {
            LocalDateTime lastUpdate = cached.get().getUpdateTime();
            if (lastUpdate != null && lastUpdate.plusHours(24).isBefore(LocalDateTime.now())) {
                shouldAutoRefresh = true;
            }
        }

        if (!refresh && !shouldAutoRefresh && cached.isPresent() && StringUtils.hasText(cached.get().getReportContent())) {
            return Result.success(buildClientPayload(readJsonMap(cached.get().getReportContent()), true, cached.get().getModelName(), cached.get().getUpdateTime()));
        }

        // 手动刷新逻辑：5分钟内不允许手动刷新
        if (refresh && cached.isPresent()) {
            LocalDateTime lastUpdate = cached.get().getUpdateTime();
            if (lastUpdate != null && lastUpdate.plusMinutes(5).isAfter(LocalDateTime.now())) {
                return Result.error("报告生成不到5分钟，请稍后再刷新");
            }
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

        // 清理旧的 PDF
        if (StringUtils.hasText(entity.getPdfUrl())) {
            try {
                ossStorageService.delete(entity.getPdfUrl());
            } catch (Exception ignored) {
            }
            entity.setPdfUrl(null);
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

        Map<String, Object> clientPayload = buildClientPayload(aiReport, false, entity.getModelName(), entity.getCreateTime());

        try {
            String pdfUrl = generateAndUploadPdf(project, student, clientPayload, sourceSnapshot);
            entity.setPdfUrl(pdfUrl);
            studentExamAiReportRepository.saveAndFlush(entity);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return Result.success(clientPayload);
    }

    @Override
    @Transactional
    public Result<String> exportExamAiReport(Long uid, String examId) {
        Result<Map<String, Object>> reportResult = getExamAiReport(uid, examId, false);
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

        if (cachedEntity.isPresent() && StringUtils.hasText(cachedEntity.get().getPdfUrl())) {
            return Result.success("导出成功", cachedEntity.get().getPdfUrl());
        }

        Map<String, Object> sourceSnapshot = cachedEntity
                .map(StudentExamAiReport::getSourceSnapshot)
                .filter(StringUtils::hasText)
                .map(this::readJsonMap)
                .orElse(Collections.emptyMap());

        try {
            String url = generateAndUploadPdf(project, studentOpt.get(), data, sourceSnapshot);
            if (cachedEntity.isPresent()) {
                cachedEntity.get().setPdfUrl(url);
                studentExamAiReportRepository.saveAndFlush(cachedEntity.get());
            }
            return Result.success("导出成功", url);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导出失败：" + e.getMessage());
        }
    }

    private String generateAndUploadPdf(ExamProject project, SysStudent student, Map<String, Object> data, Map<String, Object> sourceSnapshot) throws Exception {
        Map<String, Object> totalScore = map(sourceSnapshot.get("totalScore"));
        List<Map<String, Object>> subjectRows = listMap(sourceSnapshot.get("subjects"));

        try (PDDocument document = new PDDocument()) {
            PdfRenderContext context = new PdfRenderContext(document);

            context.drawTitle("AI 成绩分析报告", 48, true);
            context.drawText(project.getName(), 24, false, new Color(100, 116, 139));
            context.drawText("学生：" + student.getName() + " (" + student.getStudentNo() + ")", 24, false, new Color(100, 116, 139));
            context.drawText("学校：" + student.getSchool() + "    班级：" + student.getClassName(), 22, false, new Color(100, 116, 139));
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

            context.drawSectionTitle("四、各学科详细分析");
            List<Map<String, Object>> allQuestions = listMap(sourceSnapshot.get("questionAnalysis"));
            for (Map<String, Object> subjectRow : subjectRows) {
                String subjectName = asString(subjectRow.get("subjectName"));
                List<Map<String, Object>> subjectQuestions = allQuestions.stream()
                        .filter(q -> subjectName.equals(asString(q.get("subject"))))
                        .toList();
                
                if (subjectQuestions.isEmpty()) continue;

                context.drawSubTitle("【" + subjectName + "】详细分析");
                context.addSpace(12);

                context.drawLabelText("1. 小题得分分析", "");
                context.drawQuestionScoreTable(subjectQuestions);
                context.addSpace(24);

                List<Map<String, Object>> kpStats = buildKnowledgePointStats(subjectQuestions);
                if (!kpStats.isEmpty()) {
                    context.drawLabelText("2. 知识点与题型分析", "");
                    context.drawKnowledgePointTable(kpStats);
                    context.addSpace(16);
                    context.drawBullets(buildSubjectKnowledgeSummary(data, sourceSnapshot, subjectName, kpStats), new Color(71, 85, 105));
                    context.addSpace(24);
                }

                context.drawLabelText(kpStats.isEmpty() ? "2. 提升与学习计划" : "3. 提升与学习计划", "");
                context.drawBullets(buildSubjectStudyPlan(data, sourceSnapshot, subjectName, subjectRow, kpStats), new Color(59, 130, 246));
                context.addSpace(32);
            }

            context.drawSectionTitle("五、教师专属指导通道");
            context.drawText("若学习过程中遇到知识点疑惑、计划执行困难，可扫码联系专属学科老师，获得一对一针对性辅导。", 24, false, new Color(51, 65, 85));
            BufferedImage tutorImage = generateTeacherGuideQrCode(student);
            if (tutorImage != null) {
                context.drawImage(tutorImage, 260, 260);
                context.addSpace(12);
            }
            context.addSpace(20);

            context.drawSectionTitle("六、报告总结");
            Map<String, Object> summary = map(data.get("summary"));
            context.drawText(asString(summary.get("overallComment")), 26, false, new Color(51, 65, 85));
            context.addSpace(20);
            context.drawBullets(buildFinalSummaryLines(data, subjectRows, totalScore), new Color(37, 99, 235));

            context.finish();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);

            String fileName = "ai_report_" + student.getStudentNo() + "_" + project.getId() + "_" + System.currentTimeMillis() + ".pdf";
            String objectKey = "exports/reports/" + fileName;
            return ossStorageService.uploadBytes(baos.toByteArray(), objectKey, "application/pdf");
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

        public void drawQuestionScoreTable(List<Map<String, Object>> questions) {
            if (questions == null || questions.isEmpty()) return;
            int rowHeight = 44;
            int[] colWidths = { 130, 160, 160, 160, 160, 160, 150 };
            int tableWidth = 0;
            for (int w : colWidths) tableWidth += w;
            int tableHeight = rowHeight * (questions.size() + 1);
            checkSpace(tableHeight + 20);

            String[] headers = { "题号", "个人得分", "班级平均", "年级平均", "校平均", "联考平均", "满分" };
            int startX = PAGE_MARGIN + (contentWidth - tableWidth) / 2;
            int startY = currentY;

            currentGraphics.setColor(new Color(248, 250, 252));
            currentGraphics.fillRoundRect(startX, startY, tableWidth, tableHeight, 12, 12);
            currentGraphics.setColor(new Color(203, 213, 225));
            currentGraphics.drawRoundRect(startX, startY, tableWidth, tableHeight, 12, 12);

            int x = startX;
            for (int i = 0; i < headers.length; i++) {
                drawTableCell(headers[i], x, startY, colWidths[i], rowHeight, true);
                x += colWidths[i];
            }

            int currentRowY = startY + rowHeight;
            for (Map<String, Object> row : questions) {
                x = startX;
                drawTableCell(asString(row.get("questionNo")), x, currentRowY, colWidths[0], rowHeight, false); x += colWidths[0];
                drawTableCell(formatNumber(row.get("score")), x, currentRowY, colWidths[1], rowHeight, false); x += colWidths[1];
                drawTableCell(formatNumber(row.get("classAverage")), x, currentRowY, colWidths[2], rowHeight, false); x += colWidths[2];
                drawTableCell(formatNumber(row.get("gradeAverage")), x, currentRowY, colWidths[3], rowHeight, false); x += colWidths[3];
                drawTableCell(formatNumber(row.get("schoolAverage")), x, currentRowY, colWidths[4], rowHeight, false); x += colWidths[4];
                drawTableCell(formatNumber(row.get("projectAverage")), x, currentRowY, colWidths[5], rowHeight, false); x += colWidths[5];
                drawTableCell(formatNumber(row.get("fullScore")), x, currentRowY, colWidths[6], rowHeight, false);
                currentRowY += rowHeight;
            }
            currentY = currentRowY + 20;
        }

        public void drawKnowledgePointTable(List<Map<String, Object>> stats) {
            if (stats == null || stats.isEmpty()) return;
            int rowHeight = 44;
            int[] colWidths = { 320, 250, 160, 160, 190 };
            int tableWidth = 0;
            for (int w : colWidths) tableWidth += w;
            int tableHeight = rowHeight * (stats.size() + 1);
            checkSpace(tableHeight + 20);

            String[] headers = { "知识点", "题型", "个人得分", "满分", "得分率" };
            int startX = PAGE_MARGIN + (contentWidth - tableWidth) / 2;
            int startY = currentY;

            currentGraphics.setColor(new Color(248, 250, 252));
            currentGraphics.fillRoundRect(startX, startY, tableWidth, tableHeight, 12, 12);
            currentGraphics.setColor(new Color(203, 213, 225));
            currentGraphics.drawRoundRect(startX, startY, tableWidth, tableHeight, 12, 12);

            int x = startX;
            for (int i = 0; i < headers.length; i++) {
                drawTableCell(headers[i], x, startY, colWidths[i], rowHeight, true);
                x += colWidths[i];
            }

            int currentRowY = startY + rowHeight;
            for (Map<String, Object> row : stats) {
                x = startX;
                drawTableCell(asString(row.get("knowledgePoint")), x, currentRowY, colWidths[0], rowHeight, false); x += colWidths[0];
                drawTableCell(asString(row.get("questionType")), x, currentRowY, colWidths[1], rowHeight, false); x += colWidths[1];
                drawTableCell(formatNumber(row.get("score")), x, currentRowY, colWidths[2], rowHeight, false); x += colWidths[2];
                drawTableCell(formatNumber(row.get("fullScore")), x, currentRowY, colWidths[3], rowHeight, false); x += colWidths[3];
                double rate = asDouble(row.get("score")) / Math.max(asDouble(row.get("fullScore")), 1D) * 100D;
                drawTableCell(String.format("%.1f%%", rate), x, currentRowY, colWidths[4], rowHeight, false);
                currentRowY += rowHeight;
            }
            currentY = currentRowY + 20;
        }

        public void drawScoreTable(List<Map<String, Object>> subjectRows, Map<String, Object> totalScore) {
            if (subjectRows == null || subjectRows.isEmpty()) return;
            int rowHeight = 52;
            int[] colWidths = { 120, 140, 140, 140, 140, 140, 140, 120 };
            int tableWidth = 0;
            for (int w : colWidths) tableWidth += w;
            int tableHeight = rowHeight * (subjectRows.size() + 2);
            checkSpace(tableHeight + 20);

            String[] headers = { "科目", "个人成绩", "最高分", "班级平均", "年级平均", "校平均", "联考平均", "满分" };
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
                drawTableCell(formatNumber(row.get("highestScore")), x, currentRowY, colWidths[2], rowHeight, false); x += colWidths[2];
                drawTableCell(formatNumber(row.get("classAverage")), x, currentRowY, colWidths[3], rowHeight, false); x += colWidths[3];
                drawTableCell(formatNumber(row.get("gradeAverage")), x, currentRowY, colWidths[4], rowHeight, false); x += colWidths[4];
                drawTableCell(formatNumber(row.get("schoolAverage")), x, currentRowY, colWidths[5], rowHeight, false); x += colWidths[5];
                drawTableCell(formatNumber(row.get("projectAverage")), x, currentRowY, colWidths[6], rowHeight, false); x += colWidths[6];
                drawTableCell(formatNumber(row.get("fullScore")), x, currentRowY, colWidths[7], rowHeight, false);
                currentRowY += rowHeight;
            }

            x = startX;
            drawTableCell("总分", x, currentRowY, colWidths[0], rowHeight, true); x += colWidths[0];
            drawTableCell(formatNumber(totalScore.get("studentScore")), x, currentRowY, colWidths[1], rowHeight, true); x += colWidths[1];
            drawTableCell(formatNumber(totalScore.get("highestScore")), x, currentRowY, colWidths[2], rowHeight, true); x += colWidths[2];
            drawTableCell(formatNumber(totalScore.get("classAverage")), x, currentRowY, colWidths[3], rowHeight, true); x += colWidths[3];
            drawTableCell(formatNumber(totalScore.get("gradeAverage")), x, currentRowY, colWidths[4], rowHeight, true); x += colWidths[4];
            drawTableCell(formatNumber(totalScore.get("schoolAverage")), x, currentRowY, colWidths[5], rowHeight, true); x += colWidths[5];
            drawTableCell(formatNumber(totalScore.get("projectAverage")), x, currentRowY, colWidths[6], rowHeight, true); x += colWidths[6];
            drawTableCell(formatNumber(totalScore.get("fullScore")), x, currentRowY, colWidths[7], rowHeight, true);

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
        snapshot.put("questionAnalysis", buildAllQuestionDetails(context));
        snapshot.put("wrongQuestions", buildWrongQuestionPromptRows(context, wrongQuestions));
        snapshot.put("reportLimit", Map.of(
                "summaryOnly", true,
                "pushWrongQuestionsOnly", true,
                "disallowScheduleAdvice", true,
                "disallowResourceRecommendation", true
        ));
        return snapshot;
    }

    private List<Double> parseQuestionScores(String questionScores) {
        if (!StringUtils.hasText(questionScores)) return Collections.emptyList();
        try {
            return objectMapper.readValue(questionScores, new TypeReference<List<Double>>() {});
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> buildAllQuestionDetails(ProjectContext context) {
        List<Map<String, Object>> allDetails = new ArrayList<>();
        Map<String, Map<String, Object>> layoutBySubjectAndQuestion = new HashMap<>();
        context.paperLayoutMap().forEach((subjectName, layoutRows) -> layoutRows.forEach(row -> {
            String key = subjectName + "#" + asString(row.get("questionNo"));
            layoutBySubjectAndQuestion.put(key, row);
        }));

        Map<String, StudentTotalRow> studentRowMap = context.studentTotals().stream()
                .collect(Collectors.toMap(StudentTotalRow::studentNo, item -> item, (a, b) -> a));

        for (ExamStudentScore scoreRecord : context.enteredScores()) {
            if (!scoreRecord.getStudentNo().equals(context.student().getStudentNo())) continue;
            
            String subjectId = scoreRecord.getSubjectId();
            ExamSubject subject = context.subjectMap().get(subjectId);
            if (subject == null) continue;
            
            String subjectName = subject.getSubjectName();
            List<Double> questionScores = parseQuestionScores(scoreRecord.getQuestionScores());
            List<Map<String, Object>> layoutRows = context.paperLayoutMap().get(subjectName);
            if (layoutRows == null) layoutRows = Collections.emptyList();

            // Collect all scores for this subject to compute averages
            List<ExamStudentScore> allSubjectScores = context.enteredScores().stream()
                    .filter(item -> subjectId.equals(item.getSubjectId()))
                    .toList();

            for (int index = 0; index < questionScores.size(); index++) {
                Double score = questionScores.get(index);
                if (score == null) continue;

                Map<String, Object> layout = index < layoutRows.size() ? layoutRows.get(index) : Collections.emptyMap();
                String rawNo = asString(layout.get("questionNo"));
                String questionNo = StringUtils.hasText(rawNo) ? rawNo : String.valueOf(index + 1);
                String fullNo = questionNo.startsWith("第") ? questionNo : "第" + questionNo + "题";

                double sumClass = 0, sumGrade = 0, sumSchool = 0, sumProject = 0;
                int countClass = 0, countGrade = 0, countSchool = 0, countProject = 0;

                for (ExamStudentScore ss : allSubjectScores) {
                    List<Double> qs = parseQuestionScores(ss.getQuestionScores());
                    if (index < qs.size() && qs.get(index) != null) {
                        double val = qs.get(index);
                        StudentTotalRow sRow = studentRowMap.get(ss.getStudentNo());
                        if (sRow != null) {
                            if (context.currentClass().getId().equals(sRow.classId())) {
                                sumClass += val;
                                countClass++;
                            }
                            if (context.currentClass().getGrade().equals(sRow.grade())) {
                                sumGrade += val;
                                countGrade++;
                            }
                            if (context.currentClass().getSchoolId().equals(sRow.schoolId())) {
                                sumSchool += val;
                                countSchool++;
                            }
                            sumProject += val;
                            countProject++;
                        }
                    }
                }

                Map<String, Object> detail = new LinkedHashMap<>();
                detail.put("subject", subjectName);
                detail.put("questionNo", fullNo);
                detail.put("score", round(score));
                double layoutFullScore = asDouble(layout.get("fullScore"));
                double layoutScore = asDouble(layout.get("score"));
                double actualFullScore = layoutFullScore > 0 ? layoutFullScore : layoutScore;
                detail.put("fullScore", round(actualFullScore));
                detail.put("knowledgePoint", asString(layout.get("knowledgePoint")));
                detail.put("questionType", asString(layout.get("questionType")));
                detail.put("classAverage", countClass > 0 ? round(sumClass / countClass) : 0D);
                detail.put("gradeAverage", countGrade > 0 ? round(sumGrade / countGrade) : 0D);
                detail.put("schoolAverage", countSchool > 0 ? round(sumSchool / countSchool) : 0D);
                detail.put("projectAverage", countProject > 0 ? round(sumProject / countProject) : 0D);
                allDetails.add(detail);
            }
        }
        return allDetails;
    }

    private Map<String, Object> buildTotalComparison(ProjectContext context, StudentTotalRow currentTotal) {
        List<StudentTotalRow> totals = context.studentTotals();
        List<StudentTotalRow> classRows = filterTotals(totals, item -> item.classId().equals(context.currentClass().getId()));
        List<StudentTotalRow> schoolRows = filterTotals(totals, item -> item.schoolId().equals(context.currentClass().getSchoolId()));
        List<StudentTotalRow> gradeRows = filterTotals(totals, item -> item.grade().equals(context.currentClass().getGrade()));

        double totalFullScore = context.subjectMap().keySet().stream()
                .mapToDouble(subjectId -> context.fullScoreMap().getOrDefault(subjectId, 0D))
                .sum();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("studentScore", round(currentTotal.totalScore()));
        data.put("fullScore", round(totalFullScore));
        data.put("highestScore", round(totals.stream().mapToDouble(StudentTotalRow::totalScore).max().orElse(0D)));
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
            row.put("highestScore", round(projectScores.stream().mapToDouble(ExamStudentScore::getTotalScore).max().orElse(0D)));
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
                                    你只能根据输入数据总结当前考试的强势点、薄弱点和错题推送。
                                    
                                    关于数据分析指导：
                                    1. 宏观层面：结合 totalScore 和 subjects 中的最高分、各级平均分和排名，分析学生的整体竞争力。
                                    2. 微观层面：深入分析 questionAnalysis 中的每一道题，结合知识点(knowledgePoint)、题型(questionType)和得分情况。
                                    3. 知识点分析：通过 questionAnalysis 汇总分析学生在各个知识点上的得分率，找出掌握最牢固和最薄弱的知识点。
                                    4. 题型分析：分析学生在不同题型（如选择题、填空题、解答题）上的表现差异。
                                    
                                    关于输出要求：
                                    1. 在 subjectInsights 中，针对每个科目，结合该科目的具体题目得分情况进行深度点评。
                                    2. 如果某个科目没有提供知识点数据，只分析得分表现。
                                    3. 错题推送(wrongQuestionPushes)必须从 wrongQuestions 数组中选择，并结合 questionAnalysis 中的数据给出更有针对性的改进建议。
                                    4. 【严禁原文复述】绝不能在输出结果中包含“扮演一名经验丰富的初中班主任”、“根据提供的JSON数据”、“总结当前考试的强势点”等提示词原文。必须直接输出分析结论！
                                    
                                    你必须严格输出合法 JSON，结构如下（注意：JSON的值必须是你分析得出的具体内容，不要照抄我的格式说明）：
                                    {
                                      "summary": {
                                        "overallComment": "<对本次考试整体表现的总结性评价>",
                                        "strengths": ["<优势点1>", "<优势点2>"],
                                        "weaknesses": ["<薄弱点1>", "<薄弱点2>"],
                                        "focusPoints": ["<后续复习重点1>", "<重点复习方向2>"]
                                      },
                                      "subjectInsights": [
                                        {
                                          "subjectName": "<科目名称>",
                                          "strength": "<具体分析该科目的优势所在>",
                                          "weakness": "<具体分析该科目的薄弱环节>",
                                          "comparison": "<对比班级、年级平均分的位置评价>",
                                          "studyPlan": "<针对该科目的薄弱知识点和题型，给出具体的提升与学习计划>"
                                        }
                                      ],
                                      "wrongQuestionPushes": [
                                        {
                                          "subjectName": "<科目名称>",
                                          "questionNo": "<具体题号>",
                                          "knowledgePoint": "<涉及的知识点>",
                                          "reason": "<分析做错该题的具体原因>",
                                          "suggestion": "<针对该错题给出的复习建议>"
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
                    row.put("studyPlan", asString(item.get("studyPlan")));
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

    private List<Map<String, Object>> buildKnowledgePointStats(List<Map<String, Object>> questions) {
        Map<String, Map<String, Object>> stats = new LinkedHashMap<>();
        for (Map<String, Object> q : questions) {
            String kp = asString(q.get("knowledgePoint"));
            String type = asString(q.get("questionType"));
            final String finalKp = StringUtils.hasText(kp) ? kp : "";
            final String finalType = StringUtils.hasText(type) ? type : "";
            if (!StringUtils.hasText(finalKp) && !StringUtils.hasText(finalType)) {
                continue;
            }

            String key = finalKp + "||" + finalType;
            Map<String, Object> stat = stats.computeIfAbsent(key, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("knowledgePoint", finalKp);
                m.put("questionType", finalType);
                m.put("score", 0D);
                m.put("fullScore", 0D);
                return m;
            });
            stat.put("score", asDouble(stat.get("score")) + asDouble(q.get("score")));
            stat.put("fullScore", asDouble(stat.get("fullScore")) + asDouble(q.get("fullScore")));
        }
        return new ArrayList<>(stats.values());
    }

    private List<String> buildSubjectKnowledgeSummary(Map<String, Object> data, Map<String, Object> sourceSnapshot, String subjectName, List<Map<String, Object>> kpStats) {
        List<Map<String, Object>> subjectInsights = listMap(data.get("subjectInsights"));
        String strength = "";
        String weakness = "";
        for (Map<String, Object> insight : subjectInsights) {
            if (subjectName.equals(asString(insight.get("subjectName")))) {
                strength = asString(insight.get("strength"));
                weakness = asString(insight.get("weakness"));
                break;
            }
        }

        List<String> lines = new ArrayList<>();
        if (StringUtils.hasText(strength)) {
            lines.add("优势分析：" + strength);
        }
        if (StringUtils.hasText(weakness)) {
            lines.add("薄弱分析：" + weakness);
        }

        if (lines.isEmpty()) {
            List<Map<String, Object>> strengths = new ArrayList<>();
            List<Map<String, Object>> weaknesses = new ArrayList<>();
            for (Map<String, Object> stat : kpStats) {
                double fullScore = Math.max(asDouble(stat.get("fullScore")), 1D);
                double rate = asDouble(stat.get("score")) / fullScore;
                if (rate >= 0.8) strengths.add(stat);
                else if (rate < 0.6) weaknesses.add(stat);
            }

            if (!strengths.isEmpty()) {
                String names = strengths.stream().limit(3).map(s -> asString(s.get("knowledgePoint"))).collect(Collectors.joining("、"));
                lines.add("优势分析：在 " + names + " 等知识点和题型上表现优异，得分率稳定在80%以上，基础扎实，建议继续保持这种良好的解题习惯。");
            }
            if (!weaknesses.isEmpty()) {
                String names = weaknesses.stream().limit(3).map(s -> asString(s.get("knowledgePoint"))).collect(Collectors.joining("、"));
                lines.add("薄弱分析：在 " + names + " 等方面失分较多，得分率不足60%。反映出对相关概念的理解不够深入，或解题方法不够熟练，需要重点复习与强化。");
            }
            if (lines.isEmpty()) {
                lines.add("整体分析：该科目各知识点掌握较为均衡，建议在此基础上进一步提升综合应用能力，攻克难题。");
            }
        }
        return lines;
    }

    private List<String> buildSubjectStudyPlan(Map<String, Object> data, Map<String, Object> sourceSnapshot, String subjectName, Map<String, Object> subjectRow, List<Map<String, Object>> kpStats) {
        List<Map<String, Object>> subjectInsights = listMap(data.get("subjectInsights"));
        String aiStudyPlan = "";
        for (Map<String, Object> insight : subjectInsights) {
            if (subjectName.equals(asString(insight.get("subjectName")))) {
                aiStudyPlan = asString(insight.get("studyPlan"));
                break;
            }
        }

        if (StringUtils.hasText(aiStudyPlan)) {
            return List.of(aiStudyPlan);
        }

        List<String> lines = new ArrayList<>();
        List<Map<String, Object>> weaknesses = kpStats.stream()
                .filter(stat -> asDouble(stat.get("score")) / Math.max(asDouble(stat.get("fullScore")), 1D) < 0.6)
                .sorted(Comparator.comparingDouble(s -> asDouble(s.get("score")) / Math.max(asDouble(s.get("fullScore")), 1D)))
                .limit(3)
                .toList();

        if (!weaknesses.isEmpty()) {
            String kpNames = weaknesses.stream().map(s -> asString(s.get("knowledgePoint"))).distinct().collect(Collectors.joining("、"));
            String typeNames = weaknesses.stream().map(s -> asString(s.get("questionType"))).distinct().collect(Collectors.joining("、"));
            lines.add("专项突破：重点复习 " + kpNames + " 相关知识。");
            lines.add("题型训练：针对 " + typeNames + " 增加日常练习量，熟悉答题规范与技巧。");
        } else {
            lines.add("综合训练：当前基础较稳，可适当增加压轴题和综合题的训练，向高分冲刺。");
        }
        
        double studentScore = asDouble(subjectRow.get("score"));
        double gradeAvg = asDouble(subjectRow.get("gradeAverage"));
        if (studentScore < gradeAvg) {
            lines.add("阶段目标：稳扎稳打，优先保证基础题不失分，争取下次考试达到年级平均分 " + round(gradeAvg) + " 分。");
        } else {
            lines.add("阶段目标：保持优势，优化做题时间分配，争取向满分靠拢。");
        }
        return lines;
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
                String.format("平均分：个人总分 %.1f 分，最高分 %.1f 分，班级平均 %.1f 分，年级平均 %.1f 分，校平均 %.1f 分，联考平均 %.1f 分。",
                        asDouble(totalScore.get("studentScore")), asDouble(totalScore.get("highestScore")), asDouble(totalScore.get("classAverage")),
                        asDouble(totalScore.get("gradeAverage")), asDouble(totalScore.get("schoolAverage")), asDouble(totalScore.get("projectAverage"))),
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

    private BufferedImage generateTeacherGuideQrCode(SysStudent student) {
        try {
            String content = "https://example.com/tutor?studentNo=" + student.getStudentNo();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 260, 260);
            return MatrixToImageWriter.toBufferedImage(bitMatrix);
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
            List<Map<String, Object>> paperRows = listMap(readJsonValue(subject.getPaperLayouts()));
            List<Map<String, Object>> answerRows = listMap(readJsonValue(subject.getAnswersLayouts()));
            
            // Merge properties from paperLayouts and answersLayouts
            List<Map<String, Object>> mergedRows = new ArrayList<>();
            int maxLen = Math.max(paperRows.size(), answerRows.size());
            for (int i = 0; i < maxLen; i++) {
                Map<String, Object> merged = new LinkedHashMap<>();
                if (i < paperRows.size()) merged.putAll(paperRows.get(i));
                if (i < answerRows.size()) {
                    Map<String, Object> aRow = answerRows.get(i);
                    aRow.forEach((k, v) -> {
                        if (v != null && StringUtils.hasText(String.valueOf(v))) {
                            merged.put(k, v);
                        }
                    });
                }
                mergedRows.add(merged);
            }
            result.put(subject.getSubjectName(), mergedRows);
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
        if (json == null) return Collections.emptyMap();
        json = json.trim();
        if (json.startsWith("```json")) {
            json = json.substring(7);
        } else if (json.startsWith("```")) {
            json = json.substring(3);
        }
        if (json.endsWith("```")) {
            json = json.substring(0, json.length() - 3);
        }
        json = json.trim();
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
