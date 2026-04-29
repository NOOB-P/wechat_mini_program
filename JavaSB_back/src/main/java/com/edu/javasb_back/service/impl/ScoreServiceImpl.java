package com.edu.javasb_back.service.impl;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.entity.Exam;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.model.entity.ExamResult;
import com.edu.javasb_back.model.entity.ExamStudentScore;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.repository.ExamProjectRepository;
import com.edu.javasb_back.repository.ExamRepository;
import com.edu.javasb_back.repository.ExamResultRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.OssStorageService;
import com.edu.javasb_back.service.ScoreService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import java.io.ByteArrayOutputStream;

@Service
public class ScoreServiceImpl implements ScoreService {
    private static final Pattern QUESTION_NUMBER_PATTERN = Pattern.compile("(\\d+)");

    private record QuestionScoreContext(
            String classId,
            String schoolId,
            String grade,
            List<Double> questionScores) {}

    private record QuestionScoreMetrics(
            double highestScore,
            double classAvgScore,
            double schoolAvgScore,
            double gradeAvgScore,
            double projectAvgScore) {}

    private record StudentTotalContext(
            String studentNo,
            String classId,
            double totalScore) {}

    private static final int PAGE_WIDTH = 1240;
    private static final int PAGE_HEIGHT = 1754;
    private static final int PAGE_MARGIN = 70;

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
            currentCanvas = createWrongBookPageCanvas(PAGE_WIDTH, PAGE_HEIGHT);
            currentGraphics = createWrongBookGraphics(currentCanvas);
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

        public void drawQuestion(String title, List<String> sectionTitles, List<BufferedImage> sectionImages) {
            // Check if we need a new page for the title
            int titleHeight = 60; // Approximate
            if (currentY + titleHeight > PAGE_HEIGHT - PAGE_MARGIN) {
                createNewPage();
            }

            currentY = drawWrappedText(currentGraphics, title, PAGE_MARGIN, currentY, contentWidth, createUiFont(30, true), new Color(15, 23, 42), 44);
            currentY += 24;

            for (int i = 0; i < sectionImages.size(); i++) {
                BufferedImage image = sectionImages.get(i);
                String sectionTitle = sectionTitles.get(i);
                int sectionHeaderHeight = 40;

                float scale = (float) contentWidth / image.getWidth();
                int drawWidth = contentWidth;
                int drawHeight = Math.round(image.getHeight() * scale);

                // If this section (header + part of image) can't fit, start a new page
                // We at least want to fit the header and a bit of the image
                if (currentY + sectionHeaderHeight + Math.min(drawHeight, 150) > PAGE_HEIGHT - PAGE_MARGIN) {
                    createNewPage();
                    // Redraw question title (续) on new page if it's not the first section
                    currentY = drawWrappedText(currentGraphics, title + "（续）", PAGE_MARGIN, currentY, contentWidth, createUiFont(28, true), new Color(15, 23, 42), 40);
                    currentY += 24;
                }

                currentGraphics.setColor(new Color(37, 99, 235));
                currentGraphics.setFont(createUiFont(24, true));
                currentGraphics.drawString(sectionTitle, PAGE_MARGIN, currentY + 24);
                currentY += sectionHeaderHeight;

                // If the image itself is too tall for the remaining page, we need to handle it.
                // Since user wants "width first", we check if it fits. If not, we might have to move to new page.
                int remainingHeight = PAGE_HEIGHT - PAGE_MARGIN - currentY;
                if (drawHeight > remainingHeight) {
                    // If it's the first thing on the page and still too tall, we have to scale it down 
                    // to fit the page height, otherwise it will be cut off.
                    if (currentY > PAGE_MARGIN + 100) { 
                        createNewPage();
                        remainingHeight = PAGE_HEIGHT - PAGE_MARGIN - currentY;
                    }
                    
                    if (drawHeight > remainingHeight) {
                        scale = (float) remainingHeight / image.getHeight();
                        drawWidth = Math.round(image.getWidth() * scale);
                        drawHeight = remainingHeight;
                    }
                }

                int drawX = PAGE_MARGIN + (contentWidth - drawWidth) / 2;
                currentGraphics.drawImage(image, drawX, currentY, drawWidth, drawHeight, null);
                currentY += drawHeight + 40; // Space between sections
            }
            currentY += 20; // Extra space between questions
        }
    }

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

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
    private ObjectMapper objectMapper;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private OssStorageService ossStorageService;

    @PersistenceContext
    private EntityManager entityManager;

    private void forceFreshRead() {
        if (entityManager != null) {
            entityManager.clear();
        }
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final Map<String, Double> DEFAULT_FULL_SCORES = new LinkedHashMap<>();
    private static final List<String> SUBJECT_ORDER = List.of(
            "语文", "小学语文", "初中语文",
            "数学", "小学数学", "初中数学",
            "英语", "小学英语", "初中英语",
            "物理", "初中物理",
            "化学", "初中化学",
            "生物", "初中生物",
            "政治", "初中政治",
            "历史", "初中历史",
            "地理", "初中地理"
    );
    private static final Map<String, List<String>> KNOWLEDGE_POINT_MAP = new HashMap<>();

    static {
        DEFAULT_FULL_SCORES.put("语文", 150D);
        DEFAULT_FULL_SCORES.put("小学语文", 100D);
        DEFAULT_FULL_SCORES.put("初中语文", 120D);
        DEFAULT_FULL_SCORES.put("数学", 150D);
        DEFAULT_FULL_SCORES.put("小学数学", 100D);
        DEFAULT_FULL_SCORES.put("初中数学", 120D);
        DEFAULT_FULL_SCORES.put("英语", 150D);
        DEFAULT_FULL_SCORES.put("小学英语", 100D);
        DEFAULT_FULL_SCORES.put("初中英语", 120D);
        DEFAULT_FULL_SCORES.put("物理", 100D);
        DEFAULT_FULL_SCORES.put("初中物理", 100D);
        DEFAULT_FULL_SCORES.put("化学", 100D);
        DEFAULT_FULL_SCORES.put("初中化学", 100D);
        DEFAULT_FULL_SCORES.put("生物", 100D);
        DEFAULT_FULL_SCORES.put("初中生物", 100D);
        DEFAULT_FULL_SCORES.put("政治", 100D);
        DEFAULT_FULL_SCORES.put("初中政治", 100D);
        DEFAULT_FULL_SCORES.put("历史", 100D);
        DEFAULT_FULL_SCORES.put("初中历史", 100D);
        DEFAULT_FULL_SCORES.put("地理", 100D);
        DEFAULT_FULL_SCORES.put("初中地理", 100D);

        KNOWLEDGE_POINT_MAP.put("数学", List.of("基础运算", "函数理解", "综合应用", "压轴突破"));
        KNOWLEDGE_POINT_MAP.put("小学数学", List.of("基础运算", "函数理解", "综合应用", "压轴突破"));
        KNOWLEDGE_POINT_MAP.put("初中数学", List.of("基础运算", "函数理解", "综合应用", "压轴突破"));
        KNOWLEDGE_POINT_MAP.put("语文", List.of("基础积累", "阅读理解", "文言文", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("小学语文", List.of("基础积累", "阅读理解", "文言文", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("初中语文", List.of("基础积累", "阅读理解", "文言文", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("英语", List.of("词汇掌握", "语法理解", "阅读分析", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("小学英语", List.of("词汇掌握", "语法理解", "阅读分析", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("初中英语", List.of("词汇掌握", "语法理解", "阅读分析", "写作表达"));
        KNOWLEDGE_POINT_MAP.put("物理", List.of("概念掌握", "公式运用", "实验分析", "综合建模"));
        KNOWLEDGE_POINT_MAP.put("初中物理", List.of("概念掌握", "公式运用", "实验分析", "综合建模"));
        KNOWLEDGE_POINT_MAP.put("化学", List.of("基础概念", "方程推断", "实验探究", "综合应用"));
        KNOWLEDGE_POINT_MAP.put("初中化学", List.of("基础概念", "方程推断", "实验探究", "综合应用"));
        KNOWLEDGE_POINT_MAP.put("生物", List.of("概念识记", "图表分析", "实验理解", "综合迁移"));
        KNOWLEDGE_POINT_MAP.put("初中生物", List.of("概念识记", "图表分析", "实验理解", "综合迁移"));
    }

    private record ProjectSnapshot(
            ExamProject project,
            ExamClass examClass,
            List<ExamSubject> classSubjects,
            Map<String, List<ExamSubject>> projectSubjectsByName,
            Map<String, Object> benchmarks
    ) {}

    private record SegmentAnalysis(
            List<Map<String, Object>> composition,
            List<Map<String, Object>> knowledgePoints,
            String weakestName,
            double weakestValue
    ) {}

    private record ProjectAggregate(
            double currentTotalScore,
            double classAverage,
            int currentRank,
            int totalStudents,
            Map<String, Double> currentSubjectScores
    ) {}

    private record ScoreBucket(String name, double min, double max, String color) {}

    private Optional<SysStudent> getBoundStudent(Long uid) {
        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) return Optional.empty();
        return studentRepository.findById(bindings.get(0).getStudentId());
    }

    private String getStudentNoByUid(Long uid) {
        return getBoundStudent(uid).map(SysStudent::getStudentNo).orElse(null);
    }

    private boolean equalsText(String a, String b) {
        if (!StringUtils.hasText(a) || !StringUtils.hasText(b)) return false;
        return a.trim().equals(b.trim());
    }

    private double roundScore(double value) {
        return Math.round(value * 10D) / 10D;
    }

    private String calcLevel(double score, double fullScore) {
        double ratio = fullScore <= 0 ? 0D : score / fullScore;
        if (ratio >= 0.9D) return "A+";
        if (ratio >= 0.8D) return "A";
        if (ratio >= 0.7D) return "B+";
        if (ratio >= 0.6D) return "B";
        if (ratio >= 0.5D) return "C";
        return "D";
    }

    private int subjectOrderIndex(String subject) {
        int index = SUBJECT_ORDER.indexOf(subject);
        return index >= 0 ? index : SUBJECT_ORDER.size() + 1;
    }

    private List<ExamSubject> sortSubjects(List<ExamSubject> subjects) {
        return subjects.stream()
                .sorted(Comparator.comparingInt(item -> subjectOrderIndex(item.getSubjectName())))
                .toList();
    }

    private List<String> sortSubjectNames(Collection<String> subjects) {
        return subjects.stream()
                .sorted(Comparator.comparingInt(this::subjectOrderIndex))
                .toList();
    }

    @Override
    public Result<Map<String, Object>> getSemesterList(Long uid) {
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        List<ProjectSnapshot> snapshots = buildProjectSnapshots(studentOpt.get());
        if (snapshots.isEmpty()) return legacyGetSemesterList(uid);

        LinkedHashMap<String, List<Map<String, Object>>> semesterData = new LinkedHashMap<>();
        List<Map<String, Object>> semesters = new ArrayList<>();
        Set<String> semesterKeys = new HashSet<>();

        for (ProjectSnapshot snapshot : snapshots) {
            String semesterKey = deriveSemesterLabel(snapshot.project());
            if (semesterKeys.add(semesterKey)) {
                Map<String, Object> semesterMap = new HashMap<>();
                semesterMap.put("label", semesterKey);
                semesterMap.put("value", semesterKey);
                semesters.add(semesterMap);
            }

            List<Map<String, Object>> examList = semesterData.computeIfAbsent(semesterKey, key -> new ArrayList<>());
            Map<String, Object> examMap = new HashMap<>();
            examMap.put("label", snapshot.project().getName());
            examMap.put("value", snapshot.project().getId());
            examList.add(examMap);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("semesters", semesters);
        resultMap.put("semesterData", semesterData);
        return Result.success(resultMap);
    }

    @Override
    public Result<Map<String, Object>> getStudentScores(Long uid, String semester, String examId) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return legacyGetStudentScores(uid, semester, examId);

        Map<String, Object> data = buildScorePayload(student, snapshot, snapshots, examId);
        return Result.success(data);
    }

    @Override
    public Result<Map<String, Object>> getScoreComposition(Long uid, String examId, String subject) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        List<ProjectSnapshot> snapshots = buildProjectSnapshots(studentOpt.get());
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无成绩构成分析数据");

        if (isTotalSubject(subject)) {
            return Result.success(buildTotalCompositionPayload(snapshot, studentOpt.get()));
        }

        String targetSubject = resolveSubject(snapshot.classSubjects(), subject);
        ExamSubject classSubject = findClassSubject(snapshot.classSubjects(), targetSubject);
        if (classSubject == null) return Result.error("未找到对应学科成绩");

        Optional<ExamStudentScore> studentScoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(classSubject.getId(), studentOpt.get().getStudentNo());
        if (studentScoreOpt.isEmpty()) return Result.error("暂无该学科成绩数据");

        ExamStudentScore studentScore = studentScoreOpt.get();
        double fullScore = resolveFullScore(snapshot.benchmarks(), targetSubject);
        List<ExamStudentScore> scoreList = findProjectSubjectScores(snapshot, targetSubject);
        List<Map<String, Object>> regions = resolveSubjectRegions(classSubject, "original");
        List<Double> bestScores = resolveBestQuestionScores(scoreList);
        
        SegmentAnalysis segmentAnalysis = buildSegmentAnalysis(targetSubject, parseQuestionScores(studentScore.getQuestionScores()), bestScores, regions);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("examId", snapshot.project().getId());
        data.put("subject", targetSubject);
        data.put("score", roundScore(studentScore.getTotalScore()));
        data.put("fullScore", roundScore(fullScore));
        data.put("rank", calculateRank(scoreList, studentScore.getTotalScore()));
        data.put("totalStudents", scoreList.size());
        data.put("composition", segmentAnalysis.composition());
        data.put("knowledgePoints", segmentAnalysis.knowledgePoints());
        data.put("analysis", buildCompositionAnalysis(targetSubject, segmentAnalysis));
        data.put("advice", buildCompositionAdvice(targetSubject, segmentAnalysis));
        return Result.success(data);
    }

    @Override
    public Result<Map<String, Object>> getScoreDistribution(Long uid, String examId, String subject) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无分数分布数据");

        if (isTotalSubject(subject)) {
            return Result.success(buildTotalDistributionPayload(snapshot, student));
        }

        String targetSubject = resolveSubject(snapshot.classSubjects(), subject);
        ExamSubject classSubject = findClassSubject(snapshot.classSubjects(), targetSubject);
        if (classSubject == null) return Result.error("未找到对应学科成绩");

        Optional<ExamStudentScore> studentScoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(classSubject.getId(), student.getStudentNo());
        if (studentScoreOpt.isEmpty()) return Result.error("暂无该学科成绩数据");

        List<ExamStudentScore> projectScores = findProjectSubjectScores(snapshot, targetSubject);
        List<ExamStudentScore> classScores = examStudentScoreRepository.findBySubjectIdIn(List.of(classSubject.getId())).stream()
                .filter(this::isScoreEntered)
                .toList();
        double fullScore = resolveFullScore(snapshot.benchmarks(), targetSubject);
        double projectAverage = average(projectScores.stream().map(ExamStudentScore::getTotalScore).toList());
        double classAverage = classScores.isEmpty() ? projectAverage : average(classScores.stream().map(ExamStudentScore::getTotalScore).toList());
        double highestScore = projectScores.stream().map(ExamStudentScore::getTotalScore).max(Double::compareTo).orElse(0D);
        int rank = calculateRank(projectScores, studentScoreOpt.get().getTotalScore());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("subject", targetSubject);
        data.put("score", roundScore(studentScoreOpt.get().getTotalScore()));
        data.put("rank", rank);
        data.put("rankInfo", projectScores.isEmpty() ? "暂无排名" : "第" + rank + "名 / 共" + projectScores.size() + "人");
        data.put("overallLevel", calcLevel(studentScoreOpt.get().getTotalScore(), fullScore));
        data.put("averageScore", roundScore(classAverage));
        data.put("gradeAverageScore", roundScore(projectAverage));
        data.put("highestScore", roundScore(highestScore));
        data.put("studentCount", projectScores.size());
        data.put("levels", buildDistributionLevels(projectScores, fullScore));
        data.put("stats", List.of(
                statItem("我的得分", studentScoreOpt.get().getTotalScore(), "user", ""),
                statItem("年级均分", projectAverage, "chart-bar", compareText(studentScoreOpt.get().getTotalScore() - projectAverage)),
                statItem("班级均分", classAverage, "home", compareText(studentScoreOpt.get().getTotalScore() - classAverage)),
                statItem("最高分", highestScore, "medal", "距榜首 " + roundScore(highestScore - studentScoreOpt.get().getTotalScore()))
        ));
        return Result.success(data);
    }

    @Override
    public Result<Map<String, Object>> getScoreTrend(Long uid, String examId) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        if (snapshots.isEmpty()) return Result.error("暂无趋势分析数据");

        List<ProjectSnapshot> trendSnapshots = pickTrendSnapshots(snapshots, examId);
        List<Map<String, Object>> history = new ArrayList<>();
        
        // 提前预加载所有可能需要的成绩数据，减少循环内的数据库查询
        List<String> projectIds = trendSnapshots.stream().map(snapshot -> snapshot.project().getId()).distinct().toList();
        List<ExamSubject> allTrendSubjects = examSubjectRepository.findByProjectIdIn(projectIds);
        Map<String, List<ExamSubject>> subjectsByProjectId = allTrendSubjects.stream()
                .collect(Collectors.groupingBy(ExamSubject::getProjectId));

        Set<String> uniqueSubjectNames = new TreeSet<>();

        for (ProjectSnapshot snapshot : trendSnapshots) {
            try {
                ProjectAggregate aggregate = buildFastProjectAggregate(snapshot, student, subjectsByProjectId.getOrDefault(snapshot.project().getId(), Collections.emptyList()));
                if (aggregate.currentTotalScore() <= 0 && aggregate.currentSubjectScores().isEmpty()) continue;

                Map<String, Object> historyItem = new LinkedHashMap<>();
                historyItem.put("period", snapshot.project().getName());
                historyItem.put("score", roundScore(aggregate.currentTotalScore()));
                historyItem.put("rank", aggregate.currentRank());
                historyItem.put("classAvg", roundScore(aggregate.classAverage()));
                historyItem.put("subjects", aggregate.currentSubjectScores());
                history.add(historyItem);

                uniqueSubjectNames.addAll(aggregate.currentSubjectScores().keySet());
            } catch (Exception e) {
                // 单个考试处理失败不影响整体趋势展示
                continue;
            }
        }

        if (history.isEmpty()) return Result.error("暂无可用趋势数据");

        List<String> subjects = sortSubjectNames(uniqueSubjectNames);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("history", history);
        data.put("subjects", subjects);
        data.put("volatility", calcMostVolatileSubject(history, subjects));
        
        // 计算各科平均分用于强弱分析
        Map<String, Double> subjectTotalMap = new HashMap<>();
        Map<String, Integer> subjectCountMap = new HashMap<>();
        for (Map<String, Object> item : history) {
            Map<String, Double> subScores = (Map<String, Double>) item.get("subjects");
            for (Map.Entry<String, Double> entry : subScores.entrySet()) {
                subjectTotalMap.merge(entry.getKey(), entry.getValue(), Double::sum);
                subjectCountMap.merge(entry.getKey(), 1, Integer::sum);
            }
        }

        data.put("strengths", calcStrengthSubjects(subjectTotalMap, subjectCountMap, subjects, true));
        data.put("improvements", calcStrengthSubjects(subjectTotalMap, subjectCountMap, subjects, false));
        data.put("milestones", buildMilestones(history));
        data.put("insight", buildTrendInsight(history));
        
        return Result.success(data);
    }

    @Override
    public Result<Map<String, Object>> getPaperDetail(Long uid, String examId, String subject) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无试卷详情数据");

        String targetSubject = resolveSubject(snapshot.classSubjects(), subject);
        ExamSubject classSubject = findClassSubject(snapshot.classSubjects(), targetSubject);
        if (classSubject == null) return Result.error("未找到对应学科试卷");

        Optional<ExamStudentScore> studentScoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(classSubject.getId(), student.getStudentNo());
        if (studentScoreOpt.isEmpty() || !isScoreEntered(studentScoreOpt.get())) {
            return Result.error("暂无该学科试卷成绩数据");
        }

        ExamStudentScore studentScore = studentScoreOpt.get();
        List<Map<String, Object>> answers = buildPaperAnswers(snapshot, classSubject, studentScore);
        double fullScore = resolveFullScore(snapshot.benchmarks(), targetSubject);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("examId", snapshot.project().getId());
        data.put("examName", snapshot.project().getName() + " - " + targetSubject);
        data.put("subject", targetSubject);
        data.put("examDate", formatProjectDate(snapshot.project()));
        data.put("score", roundScore(studentScore.getTotalScore()));
        data.put("fullScore", roundScore(fullScore));
        data.put("teacherComment", buildTeacherComment(targetSubject, answers));
        data.put("myPaperImages", collectPaperImages(studentScore.getAnswerSheetUrl()));
        data.put("examPaperImages", collectPaperImages(
                StringUtils.hasText(classSubject.getPaperUrl()) ? classSubject.getPaperUrl() : classSubject.getAnswerUrl()
        ));
        data.put("questionScores", answers);
        data.put("originalDownloadUrl", ossStorageService.toCdnUrl(studentScore.getAnswerSheetUrl()));
        data.put("examPaperDownloadUrl", ossStorageService.toCdnUrl(
                StringUtils.hasText(classSubject.getPaperUrl()) ? classSubject.getPaperUrl() : classSubject.getAnswerUrl()
        ));
        data.put("downloadUrl", ossStorageService.toCdnUrl(StringUtils.hasText(studentScore.getAnswerSheetUrl()) ? studentScore.getAnswerSheetUrl() : classSubject.getPaperUrl()));
        return Result.success(data);
    }

    @Override
    public Result<String> exportWrongBook(Long uid, String examId, String subject) {
        forceFreshRead();
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无试卷详情数据");

        String onlySubject = "all".equals(subject) ? null : subject;
        List<Map<String, Object>> wrongQuestions = buildWrongQuestionRows(snapshot, student, onlySubject);
        if (wrongQuestions.isEmpty()) return Result.error("当前筛选条件下暂无错题，无需导出");

        // 按科目分组，保持科目顺序
        Map<String, List<Map<String, Object>>> groupedQuestions = wrongQuestions.stream()
                .collect(Collectors.groupingBy(q -> (String) q.get("subject"), LinkedHashMap::new, Collectors.toList()));

        try (PDDocument document = new PDDocument()) {
            Map<String, BufferedImage> sourceImageCache = new HashMap<>();
            List<Path> tempFiles = new ArrayList<>();

            appendImagePage(document, buildWrongBookCoverImage(student, snapshot, onlySubject, wrongQuestions.size()));

            PdfRenderContext context = new PdfRenderContext(document);

            Map<String, ExamSubject> subjectMap = snapshot.classSubjects().stream()
                    .collect(Collectors.toMap(ExamSubject::getSubjectName, item -> item, (a, b) -> a, LinkedHashMap::new));

            for (Map.Entry<String, List<Map<String, Object>>> entry : groupedQuestions.entrySet()) {
                String subjectName = entry.getKey();
                ExamSubject classSubject = subjectMap.get(subjectName);
                if (classSubject == null) {
                    continue;
                }
                ExamStudentScore studentScore = examStudentScoreRepository
                        .findBySubjectIdAndStudentNo(classSubject.getId(), student.getStudentNo())
                        .orElse(null);
                if (studentScore == null) {
                    continue;
                }

                List<Map<String, Object>> originalRegions = resolveSubjectRegions(classSubject, "original");
                List<Map<String, Object>> answerRegions = resolveSubjectRegions(classSubject, "template");
                List<Map<String, Object>> studentRegions = resolveStudentRegions(studentScore);

                for (Map<String, Object> wrongQuestion : entry.getValue()) {
                    String questionNo = stringValue(wrongQuestion.get("questionNo"));

                    List<BufferedImage> sectionImages = new ArrayList<>();
                    List<String> sectionTitles = new ArrayList<>();

                    BufferedImage questionImage = buildSectionComposite(
                            StringUtils.hasText(classSubject.getPaperUrl()) ? classSubject.getPaperUrl() : (String) wrongQuestion.get("sliceImageUrl"),
                            collectRegionsByQuestionNo(originalRegions, questionNo),
                            sourceImageCache,
                            tempFiles
                    );
                    if (questionImage == null) {
                        questionImage = loadStandaloneImage((String) wrongQuestion.get("sliceImageUrl"), sourceImageCache, tempFiles);
                    }
                    if (questionImage != null) {
                        sectionTitles.add("题目");
                        sectionImages.add(questionImage);
                    }

                    BufferedImage answerImage = buildSectionComposite(
                            classSubject.getAnswerUrl(),
                            collectRegionsByQuestionNo(answerRegions, questionNo),
                            sourceImageCache,
                            tempFiles
                    );
                    if (answerImage != null) {
                        sectionTitles.add("答案与解析");
                        sectionImages.add(answerImage);
                    }

                    BufferedImage studentImage = buildSectionComposite(
                            studentScore.getAnswerSheetUrl(),
                            collectRegionsByQuestionNo(StringUtils.hasText(studentScore.getAnswerSheetLayouts()) ? studentRegions : answerRegions, questionNo),
                            sourceImageCache,
                            tempFiles
                    );
                    if (studentImage != null) {
                        sectionTitles.add("学生答案");
                        sectionImages.add(studentImage);
                    }

                    if (sectionImages.isEmpty()) {
                        continue;
                    }

                    String title = buildWrongQuestionTitle(wrongQuestion);
                    context.drawQuestion(title, sectionTitles, sectionImages);
                }
            }
            context.finish();

            cleanupTempFiles(tempFiles);
            if (document.getNumberOfPages() == 0) {
                return Result.error("导出失败：无法处理错题图片");
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            
            String fileName = "wrongbook_" + student.getStudentNo() + "_" + (onlySubject != null ? safePathSegment(onlySubject) : "all") + "_" + System.currentTimeMillis() + ".pdf";
            String objectKey = "exports/wrongbooks/" + fileName;
            String url = ossStorageService.uploadBytes(baos.toByteArray(), objectKey, "application/pdf");
            
            return Result.success("导出成功", url);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导出失败：" + e.getMessage());
        }
    }

    private List<Map<String, Object>> resolveStudentRegions(ExamStudentScore score) {
        if (score == null || !StringUtils.hasText(score.getAnswerSheetLayouts())) {
            return Collections.emptyList();
        }
        Object regionNode = readJsonValue(score.getAnswerSheetLayouts());
        if (!(regionNode instanceof Collection<?> collection)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : collection) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((key, value) -> row.put(String.valueOf(key), value));
                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, Object>> collectRegionsByQuestionNo(List<Map<String, Object>> regions, String questionNo) {
        if (regions == null || regions.isEmpty()) {
            return Collections.emptyList();
        }
        String normalizedTarget = normalizeQuestionNo(questionNo, 0);
        return regions.stream()
                .filter(region -> normalizedTarget.equals(normalizeQuestionNo(stringValue(region.get("questionNo")), 0)))
                .toList();
    }

    private BufferedImage loadStandaloneImage(String url, Map<String, BufferedImage> cache, List<Path> tempFiles) {
        if (!StringUtils.hasText(url)) {
            return null;
        }
        if (cache.containsKey(url)) {
            return cache.get(url);
        }
        Path imagePath = null;
        try {
            imagePath = resolvePaperPath(url);
            if (imagePath == null || !Files.exists(imagePath)) {
                return null;
            }
            BufferedImage image = ImageIO.read(imagePath.toFile());
            if (image != null) {
                cache.put(url, image);
                if (ossStorageService.isOssUrl(url)) {
                    tempFiles.add(imagePath);
                }
            }
            return image;
        } catch (Exception ex) {
            return null;
        }
    }

    private BufferedImage buildSectionComposite(
            String sourceUrl,
            List<Map<String, Object>> regions,
            Map<String, BufferedImage> cache,
            List<Path> tempFiles) {
        if (!StringUtils.hasText(sourceUrl) || regions == null || regions.isEmpty()) {
            return null;
        }
        BufferedImage sourceImage = loadStandaloneImage(sourceUrl, cache, tempFiles);
        if (sourceImage == null) {
            return null;
        }

        List<BufferedImage> parts = new ArrayList<>();
        for (Map<String, Object> region : regions) {
            BufferedImage cropped = cropRegionImage(sourceImage, region);
            if (cropped != null) {
                parts.add(cropped);
            }
        }
        if (parts.isEmpty()) {
            return null;
        }
        return stitchImagesVertically(parts, 18, 24, new Color(248, 250, 252));
    }

    private BufferedImage cropRegionImage(BufferedImage sourceImage, Map<String, Object> region) {
        if (sourceImage == null || region == null || region.isEmpty()) {
            return null;
        }
        double xRatio = clampRatio(numberValue(region.get("x")));
        double yRatio = clampRatio(numberValue(region.get("y")));
        double widthRatio = clampRatio(numberValue(region.get("width")));
        double heightRatio = clampRatio(numberValue(region.get("height")));
        int x = Math.min((int) Math.floor(xRatio * sourceImage.getWidth()), Math.max(sourceImage.getWidth() - 1, 0));
        int y = Math.min((int) Math.floor(yRatio * sourceImage.getHeight()), Math.max(sourceImage.getHeight() - 1, 0));
        int width = Math.max((int) Math.ceil(widthRatio * sourceImage.getWidth()), 1);
        int height = Math.max((int) Math.ceil(heightRatio * sourceImage.getHeight()), 1);
        width = Math.min(width, sourceImage.getWidth() - x);
        height = Math.min(height, sourceImage.getHeight() - y);
        if (width <= 0 || height <= 0) {
            return null;
        }
        return sourceImage.getSubimage(x, y, width, height);
    }

    private BufferedImage stitchImagesVertically(List<BufferedImage> images, int gap, int padding, Color backgroundColor) {
        int width = images.stream().mapToInt(BufferedImage::getWidth).max().orElse(1) + padding * 2;
        int height = images.stream().mapToInt(BufferedImage::getHeight).sum()
                + Math.max(images.size() - 1, 0) * gap
                + padding * 2;
        BufferedImage canvas = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = canvas.createGraphics();
        try {
            graphics.setColor(backgroundColor);
            graphics.fillRect(0, 0, width, height);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            int currentY = padding;
            for (BufferedImage image : images) {
                int x = padding + (width - padding * 2 - image.getWidth()) / 2;
                graphics.drawImage(image, x, currentY, null);
                currentY += image.getHeight() + gap;
            }
        } finally {
            graphics.dispose();
        }
        return canvas;
    }

    private String buildWrongQuestionTitle(Map<String, Object> wrongQuestion) {
        String questionNo = stringValue(wrongQuestion.get("questionNo"));
        String knowledgePoint = stringValue(wrongQuestion.get("knowledgePoint"));
        String scoreText = roundScore(numberValue(wrongQuestion.get("myScore"))) + "/" + roundScore(numberValue(wrongQuestion.get("highestScore")));
        StringBuilder builder = new StringBuilder();
        builder.append(StringUtils.hasText(questionNo) ? questionNo : "题目");
        if (StringUtils.hasText(knowledgePoint)) {
            builder.append("  |  ").append(knowledgePoint);
        }
        builder.append("  |  ").append(scoreText).append("分");
        return builder.toString();
    }

    private BufferedImage buildWrongBookCoverImage(SysStudent student, ProjectSnapshot snapshot, String onlySubject, int wrongCount) {
        int width = PAGE_WIDTH;
        int height = PAGE_HEIGHT;
        BufferedImage canvas = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = canvas.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            // 背景色
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);

            // 装饰性顶部蓝色区块
            graphics.setColor(new Color(37, 99, 235));
            graphics.fillRect(0, 0, width, 400);

            // 主标题
            graphics.setColor(Color.WHITE);
            graphics.setFont(createUiFont(72, true));
            String mainTitle = "个人错题本";
            FontMetrics mainMetrics = graphics.getFontMetrics();
            graphics.drawString(mainTitle, (width - mainMetrics.stringWidth(mainTitle)) / 2, 220);

            // 副标题 (产品名)
            graphics.setFont(createUiFont(32, false));
            String subTitle = "优题慧 · 智能考试分析系统";
            FontMetrics subMetrics = graphics.getFontMetrics();
            graphics.drawString(subTitle, (width - subMetrics.stringWidth(subTitle)) / 2, 280);

            // 中间内容区块
            int cardX = 140;
            int cardY = 350;
            int cardWidth = width - cardX * 2;
            int cardHeight = 850;

            // 阴影效果
            graphics.setColor(new Color(0, 0, 0, 20));
            graphics.fillRoundRect(cardX + 8, cardY + 8, cardWidth, cardHeight, 40, 40);

            // 卡片背景
            graphics.setColor(Color.WHITE);
            graphics.fillRoundRect(cardX, cardY, cardWidth, cardHeight, 40, 40);
            graphics.setColor(new Color(226, 232, 240));
            graphics.setStroke(new java.awt.BasicStroke(2));
            graphics.drawRoundRect(cardX, cardY, cardWidth, cardHeight, 40, 40);

            // 试卷名称
            graphics.setColor(new Color(15, 23, 42));
            graphics.setFont(createUiFont(36, true));
            String examName = snapshot.project().getName();
            int examY = cardY + 100;
            drawCenteredString(graphics, examName, cardX, examY, cardWidth);

            // 分割线
            graphics.setColor(new Color(226, 232, 240));
            graphics.drawLine(cardX + 80, examY + 60, cardX + cardWidth - 80, examY + 60);

            // 信息列表
            int infoStartX = cardX + 120;
            int infoY = examY + 160;
            int infoGap = 80;
            graphics.setFont(createUiFont(28, false));
            
            String[][] infoItems = {
                {"学    校：", stringValue(student.getSchool())},
                {"姓    名：", stringValue(student.getName())},
                {"班    级：", stringValue(student.getGrade()) + " " + stringValue(student.getClassName())},
                {"学    号：", stringValue(student.getStudentNo())},
                {"科    目：", StringUtils.hasText(onlySubject) ? onlySubject : "全部科目"},
                {"错题数量：", wrongCount + " 题"},
                {"生成时间：", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))}
            };

            for (String[] item : infoItems) {
                graphics.setColor(new Color(100, 116, 139));
                graphics.drawString(item[0], infoStartX, infoY);
                graphics.setColor(new Color(15, 23, 42));
                graphics.drawString(item[1], infoStartX + 160, infoY);
                infoY += infoGap;
            }

            // 底部页脚
            graphics.setColor(new Color(148, 163, 184));
            graphics.setFont(createUiFont(24, false));
            String footer = "© 优题慧 · 让考试更有价值";
            FontMetrics footerMetrics = graphics.getFontMetrics();
            graphics.drawString(footer, (width - footerMetrics.stringWidth(footer)) / 2, height - 120);

        } finally {
            graphics.dispose();
        }
        return canvas;
    }

    private void drawCenteredString(Graphics2D g, String text, int x, int y, int width) {
        FontMetrics metrics = g.getFontMetrics();
        int drawX = x + (width - metrics.stringWidth(text)) / 2;
        g.drawString(text, drawX, y);
    }

    private BufferedImage createWrongBookPageCanvas(int width, int height) {
        BufferedImage canvas = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = canvas.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
        } finally {
            graphics.dispose();
        }
        return canvas;
    }

    private Graphics2D createWrongBookGraphics(BufferedImage canvas) {
        Graphics2D graphics = canvas.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        return graphics;
    }

    private Font createUiFont(int size, boolean bold) {
        return new Font("Microsoft YaHei", bold ? Font.BOLD : Font.PLAIN, size);
    }

    private int drawWrappedText(
            Graphics2D graphics,
            String text,
            int x,
            int y,
            int maxWidth,
            Font font,
            Color color,
            int lineHeight) {
        graphics.setFont(font);
        graphics.setColor(color);
        FontMetrics metrics = graphics.getFontMetrics(font);
        StringBuilder line = new StringBuilder();
        int currentY = y;
        for (char ch : text.toCharArray()) {
            String next = line + String.valueOf(ch);
            if (metrics.stringWidth(next) > maxWidth && line.length() > 0) {
                graphics.drawString(line.toString(), x, currentY + metrics.getAscent());
                currentY += lineHeight;
                line = new StringBuilder(String.valueOf(ch));
            } else {
                line.append(ch);
            }
        }
        if (line.length() > 0) {
            graphics.drawString(line.toString(), x, currentY + metrics.getAscent());
            currentY += lineHeight;
        }
        return currentY;
    }

    private void appendImagePage(PDDocument document, BufferedImage image) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);
        PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            contentStream.drawImage(pdImage, 0, 0, PDRectangle.A4.getWidth(), PDRectangle.A4.getHeight());
        }
    }

    private void cleanupTempFiles(List<Path> tempFiles) {
        for (Path tempFile : tempFiles) {
            try {
                Files.deleteIfExists(tempFile);
            } catch (Exception ignored) {
            }
        }
    }

    private ProjectAggregate buildFastProjectAggregate(ProjectSnapshot snapshot, SysStudent student, List<ExamSubject> classSubjects) {
        // 获取该考试项目下所有科目的成绩，用于计算排名
        List<String> allSubjectIds = snapshot.projectSubjectsByName().values().stream()
                .flatMap(Collection::stream)
                .map(ExamSubject::getId)
                .toList();
        
        List<ExamStudentScore> allScores = examStudentScoreRepository.findBySubjectIdIn(allSubjectIds).stream()
                .filter(this::isScoreEntered)
                .toList();

        Map<String, Double> totalMap = new HashMap<>();
        for (ExamStudentScore score : allScores) {
            totalMap.merge(score.getStudentNo(), score.getTotalScore(), Double::sum);
        }

        // 计算班级平均分
        List<String> currentClassSubjectIds = classSubjects.stream().map(ExamSubject::getId).toList();
        double classAvg = allScores.stream()
                .filter(s -> currentClassSubjectIds.contains(s.getSubjectId()))
                .collect(Collectors.groupingBy(ExamStudentScore::getStudentNo, Collectors.summingDouble(ExamStudentScore::getTotalScore)))
                .values().stream().mapToDouble(Double::doubleValue).average().orElse(0D);

        // 计算个人各科分数
        Map<String, Double> currentSubjectScores = new LinkedHashMap<>();
        double currentTotalScore = 0D;
        for (ExamSubject subject : classSubjects) {
            double score = allScores.stream()
                    .filter(s -> s.getSubjectId().equals(subject.getId()) && s.getStudentNo().equals(student.getStudentNo()))
                    .findFirst()
                    .map(ExamStudentScore::getTotalScore)
                    .orElse(0D);
            currentSubjectScores.put(subject.getSubjectName(), roundScore(score));
            currentTotalScore += score;
        }

        int rank = 1;
        double myTotal = currentTotalScore;
        for (Double total : totalMap.values()) {
            if (total > myTotal + 0.01) rank++;
        }

        return new ProjectAggregate(
                roundScore(currentTotalScore),
                roundScore(classAvg),
                rank,
                totalMap.size(),
                currentSubjectScores
        );
    }

    private List<ProjectSnapshot> buildProjectSnapshots(SysStudent student) {
        List<ExamStudentScore> studentScores = examStudentScoreRepository.findByStudentNo(student.getStudentNo());
        Map<String, ExamStudentScore> studentScoreMap = studentScores.stream()
                .collect(Collectors.toMap(ExamStudentScore::getSubjectId, item -> item, (a, b) -> b));

        return examProjectRepository.findAll().stream()
                .sorted(Comparator.comparing(this::projectTime).reversed())
                .map(project -> buildSnapshot(project, student, studentScoreMap))
                .filter(Objects::nonNull)
                .toList();
    }

    private ProjectSnapshot buildSnapshot(ExamProject project, SysStudent student, Map<String, ExamStudentScore> studentScoreMap) {
        List<ExamClass> examClasses = examClassRepository.findByProjectId(project.getId());
        if (examClasses.isEmpty()) return null;

        ExamClass matchedClass = matchExamClass(student, examClasses);
        if (matchedClass == null) return null;

        List<ExamSubject> classSubjects = examSubjectRepository.findByProjectIdOrderBySubjectNameAsc(project.getId());
        if (classSubjects.isEmpty()) return null;

        boolean hasStudentScore = classSubjects.stream()
                .map(ExamSubject::getId)
                .map(studentScoreMap::get)
                .anyMatch(this::isScoreEntered);
        if (!hasStudentScore) return null;

        Map<String, List<ExamSubject>> projectSubjectsByName = classSubjects.stream()
                .collect(Collectors.groupingBy(ExamSubject::getSubjectName, LinkedHashMap::new, Collectors.toList()));

        return new ProjectSnapshot(project, matchedClass, sortSubjects(classSubjects), projectSubjectsByName, parseBenchmarks(project.getSubjectBenchmarks()));
    }

    private ExamClass matchExamClass(SysStudent student, List<ExamClass> examClasses) {
        if (StringUtils.hasText(student.getClassId())) {
            Optional<ExamClass> exact = examClasses.stream()
                    .filter(item -> student.getClassId().equals(item.getSourceClassId()))
                    .findFirst();
            if (exact.isPresent()) return exact.get();
        }

        return examClasses.stream()
                .filter(item -> equalsText(item.getSchool(), student.getSchool())
                        && equalsText(item.getGrade(), student.getGrade())
                        && equalsText(item.getClassName(), student.getClassName()))
                .findFirst()
                .orElse(null);
    }

    private ProjectSnapshot resolveSnapshot(List<ProjectSnapshot> snapshots, String examId) {
        if (snapshots.isEmpty()) return null;
        if (!StringUtils.hasText(examId)) return snapshots.get(0);
        return snapshots.stream()
                .filter(item -> examId.equals(item.project().getId()))
                .findFirst()
                .orElse(null);
    }

    private List<ProjectSnapshot> pickTrendSnapshots(List<ProjectSnapshot> snapshots, String anchorExamId) {
        if (snapshots.isEmpty()) return Collections.emptyList();
        int startIndex = 0;
        if (StringUtils.hasText(anchorExamId)) {
            for (int i = 0; i < snapshots.size(); i++) {
                if (anchorExamId.equals(snapshots.get(i).project().getId())) {
                    startIndex = i;
                    break;
                }
            }
        }
        // 修改逻辑：默认显示最近 6 次，如果总次数不足 6 次，则显示所有可用次数
        int limit = 6;
        int endIndex = Math.min(startIndex + limit, snapshots.size());
        List<ProjectSnapshot> picked = new ArrayList<>(snapshots.subList(startIndex, endIndex));
        Collections.reverse(picked);
        return picked;
    }

    private Map<String, Object> buildScorePayload(SysStudent student, ProjectSnapshot snapshot, List<ProjectSnapshot> snapshots, String examId) {
        List<Map<String, Object>> subjects = new ArrayList<>();
        double totalScore = 0D;
        double totalFullScore = 0D;

        for (ExamSubject subject : snapshot.classSubjects()) {
            double fullScore = resolveFullScore(snapshot.benchmarks(), subject.getSubjectName());
            Optional<ExamStudentScore> scoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(subject.getId(), student.getStudentNo());
            double score = scoreOpt.filter(this::isScoreEntered).map(ExamStudentScore::getTotalScore).orElse(0D);
            totalScore += score;
            totalFullScore += fullScore;
            subjects.add(subjectItem(subject.getSubjectName(), score, fullScore, calcLevel(score, fullScore)));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("examId", snapshot.project().getId());
        data.put("examName", snapshot.project().getName());
        data.put("examDate", formatProjectDate(snapshot.project()));
        data.put("totalScore", roundScore(totalScore));
        data.put("totalLevel", calcLevel(totalScore, totalFullScore <= 0 ? 100D : totalFullScore));
        data.put("subjects", subjects);
        data.put("history", buildHistoryOnly(student, pickTrendSnapshots(snapshots, examId)));
        data.put("wrongQuestions", buildWrongQuestionRows(snapshot, student, null));
        return data;
    }

    private List<Map<String, Object>> buildHistoryOnly(SysStudent student, List<ProjectSnapshot> snapshots) {
        return snapshots.stream().map(snapshot -> {
            ProjectAggregate aggregate = buildProjectAggregate(snapshot, student);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("period", snapshot.project().getName());
            item.put("score", roundScore(aggregate.currentTotalScore()));
            item.put("subjects", aggregate.currentSubjectScores());
            return item;
        }).toList();
    }

    private ProjectAggregate buildProjectAggregate(ProjectSnapshot snapshot, SysStudent student) {
        List<String> allSubjectIds = snapshot.projectSubjectsByName().values().stream()
                .flatMap(Collection::stream)
                .map(ExamSubject::getId)
                .distinct()
                .toList();
        List<ExamStudentScore> allScores = examStudentScoreRepository.findBySubjectIdIn(allSubjectIds).stream()
                .filter(this::isScoreEntered)
                .toList();
        Map<String, Double> totalMap = new HashMap<>();
        for (ExamStudentScore score : allScores) {
            totalMap.merge(score.getStudentNo(), score.getTotalScore(), Double::sum);
        }

        List<String> classSubjectIds = snapshot.classSubjects().stream().map(ExamSubject::getId).toList();
        List<ExamStudentScore> classScores = examStudentScoreRepository.findBySubjectIdIn(classSubjectIds).stream()
                .filter(this::isScoreEntered)
                .toList();
        Map<String, Double> classTotalMap = new HashMap<>();
        for (ExamStudentScore score : classScores) {
            classTotalMap.merge(score.getStudentNo(), score.getTotalScore(), Double::sum);
        }

        Map<String, Double> currentSubjectScores = new LinkedHashMap<>();
        double currentTotalScore = 0D;
        for (ExamSubject subject : snapshot.classSubjects()) {
            Optional<ExamStudentScore> scoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(subject.getId(), student.getStudentNo());
            double score = scoreOpt.filter(this::isScoreEntered).map(ExamStudentScore::getTotalScore).orElse(0D);
            currentSubjectScores.put(subject.getSubjectName(), roundScore(score));
            currentTotalScore += score;
        }

        int rank = 1;
        for (Double total : totalMap.values().stream().sorted(Comparator.reverseOrder()).toList()) {
            if (total > currentTotalScore) rank++;
            else break;
        }

        return new ProjectAggregate(
                roundScore(currentTotalScore),
                roundScore(average(new ArrayList<>(classTotalMap.values()))),
                rank,
                totalMap.size(),
                currentSubjectScores
        );
    }

    private List<ExamStudentScore> findProjectSubjectScores(ProjectSnapshot snapshot, String subjectName) {
        List<ExamSubject> relevantSubjects = snapshot.projectSubjectsByName().getOrDefault(subjectName, Collections.emptyList());
        if (relevantSubjects.isEmpty()) return Collections.emptyList();
        return examStudentScoreRepository.findBySubjectIdIn(relevantSubjects.stream().map(ExamSubject::getId).toList()).stream()
                .filter(this::isScoreEntered)
                .toList();
    }

    private Map<String, Object> buildTotalCompositionPayload(ProjectSnapshot snapshot, SysStudent student) {
        List<StudentTotalContext> totalContexts = buildProjectTotalContexts(snapshot);
        double totalFullScore = snapshot.classSubjects().stream()
                .mapToDouble(subject -> resolveFullScore(snapshot.benchmarks(), subject.getSubjectName()))
                .sum();
        List<Map<String, Object>> composition = new ArrayList<>();
        String weakestName = "总分";
        double weakestValue = 100D;
        double currentTotalScore = 0D;

        for (ExamSubject subject : snapshot.classSubjects()) {
            double fullScore = resolveFullScore(snapshot.benchmarks(), subject.getSubjectName());
            double score = examStudentScoreRepository.findBySubjectIdAndStudentNo(subject.getId(), student.getStudentNo())
                    .filter(this::isScoreEntered)
                    .map(ExamStudentScore::getTotalScore)
                    .orElse(0D);
            currentTotalScore += score;
            double percent = fullScore <= 0 ? 0D : roundScore((score / fullScore) * 100D);
            percent = Math.max(0D, Math.min(100D, percent));
            if (percent < weakestValue) {
                weakestValue = percent;
                weakestName = subject.getSubjectName();
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", subject.getSubjectName());
            item.put("value", percent);
            item.put("level", masteryLevel(percent));
            item.put("color", masteryColor(percent));
            composition.add(item);
        }

        SegmentAnalysis analysis = new SegmentAnalysis(composition, Collections.emptyList(), weakestName, weakestValue);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("examId", snapshot.project().getId());
        data.put("subject", "总分");
        data.put("score", roundScore(currentTotalScore));
        data.put("fullScore", roundScore(totalFullScore));
        data.put("rank", calculateRankFromTotals(totalContexts, student.getStudentNo(), currentTotalScore));
        data.put("totalStudents", totalContexts.size());
        data.put("composition", composition);
        data.put("knowledgePoints", Collections.emptyList());
        data.put("analysis", buildTotalCompositionAnalysis(analysis));
        data.put("advice", buildTotalCompositionAdvice(analysis));
        return data;
    }

    private Map<String, Object> buildTotalDistributionPayload(ProjectSnapshot snapshot, SysStudent student) {
        List<StudentTotalContext> totalContexts = buildProjectTotalContexts(snapshot);
        double totalFullScore = snapshot.classSubjects().stream()
                .mapToDouble(subject -> resolveFullScore(snapshot.benchmarks(), subject.getSubjectName()))
                .sum();
        double currentTotalScore = totalContexts.stream()
                .filter(item -> Objects.equals(item.studentNo(), student.getStudentNo()))
                .mapToDouble(StudentTotalContext::totalScore)
                .findFirst()
                .orElse(0D);
        int rank = calculateRankFromTotals(totalContexts, student.getStudentNo(), currentTotalScore);
        List<Double> allScores = totalContexts.stream().map(StudentTotalContext::totalScore).toList();
        List<Double> classScores = totalContexts.stream()
                .filter(item -> Objects.equals(item.classId(), snapshot.examClass().getId()))
                .map(StudentTotalContext::totalScore)
                .toList();
        double gradeAverage = average(allScores);
        double classAverage = average(classScores);
        double highestScore = allScores.stream().mapToDouble(Double::doubleValue).max().orElse(0D);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("subject", "总分");
        data.put("score", roundScore(currentTotalScore));
        data.put("rank", rank);
        data.put("rankInfo", totalContexts.isEmpty() ? "暂无排名" : "第" + rank + "名 / 共" + totalContexts.size() + "人");
        data.put("overallLevel", calcLevel(currentTotalScore, totalFullScore));
        data.put("averageScore", roundScore(classAverage));
        data.put("gradeAverageScore", roundScore(gradeAverage));
        data.put("highestScore", roundScore(highestScore));
        data.put("studentCount", totalContexts.size());
        data.put("levels", buildDistributionLevelsFromValues(allScores, totalFullScore));
        data.put("stats", List.of(
                statItem("我的总分", currentTotalScore, "user", ""),
                statItem("年级均分", gradeAverage, "chart-bar", compareText(currentTotalScore - gradeAverage)),
                statItem("班级均分", classAverage, "home", compareText(currentTotalScore - classAverage)),
                statItem("最高分", highestScore, "medal", "距榜首 " + roundScore(highestScore - currentTotalScore))
        ));
        return data;
    }

    private Result<Map<String, Object>> legacyGetSemesterList(Long uid) {
        String studentNo = getStudentNoByUid(uid);
        if (studentNo == null) return Result.error("未绑定学生账号");

        List<Exam> exams = examRepository.findExamsByStudentNo(studentNo);
        Map<String, List<Map<String, Object>>> semesterData = new HashMap<>();
        List<Map<String, Object>> semesters = new ArrayList<>();
        Set<String> processedSemesters = new HashSet<>();

        for (Exam exam : exams) {
            String name = exam.getName();
            String semesterKey = "未知学期";
            if (name.contains("第一学期") || name.contains("第二学期")) {
                semesterKey = name.substring(0, name.indexOf("学期") + 2);
            } else if (name.contains("春季学期") || name.contains("秋季学期")) {
                int index = name.contains("春季学期") ? name.indexOf("春季学期") + 4 : name.indexOf("秋季学期") + 4;
                semesterKey = name.substring(0, index);
            } else if (name.matches("^\\d{4}年.*")) {
                semesterKey = name.substring(0, 5) + "学年";
            } else {
                semesterKey = exam.getExamDate().getYear() + "学年";
            }

            if (processedSemesters.add(semesterKey)) {
                Map<String, Object> semesterMap = new HashMap<>();
                semesterMap.put("label", semesterKey);
                semesterMap.put("value", semesterKey);
                semesters.add(semesterMap);
            }

            List<Map<String, Object>> examList = semesterData.computeIfAbsent(semesterKey, k -> new ArrayList<>());
            Map<String, Object> examMap = new HashMap<>();
            examMap.put("label", exam.getName());
            examMap.put("value", exam.getId());
            examList.add(examMap);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("semesters", semesters);
        resultMap.put("semesterData", semesterData);
        return Result.success(resultMap);
    }

    private Result<Map<String, Object>> legacyGetStudentScores(Long uid, String semester, String examId) {
        String studentNo = getStudentNoByUid(uid);
        if (studentNo == null) return Result.error("未绑定学生账号");

        Optional<ExamResult> resultOpt = examResultRepository.findByStudentNoAndExamId(studentNo, examId);
        if (resultOpt.isEmpty()) return Result.error("暂无该场考试成绩");

        ExamResult er = resultOpt.get();
        Optional<Exam> examOpt = examRepository.findById(examId);
        Exam exam = examOpt.orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("examId", examId);
        data.put("examName", exam != null ? exam.getName() : "未知考试");
        data.put("examDate", exam != null ? exam.getExamDate().toString() : "");
        data.put("totalScore", er.getTotalScore());
        data.put("totalLevel", calcLevel(er.getTotalScore(), 100D));
        data.put("subjects", List.of(
                subjectItem("语文", Math.round(er.getTotalScore() * 0.8), 150, "A"),
                subjectItem("数学", Math.round(er.getTotalScore() * 0.9), 150, "A+"),
                subjectItem("英语", Math.round(er.getTotalScore() * 0.7), 150, "B")
        ));
        data.put("wrongQuestions", Collections.emptyList());
        return Result.success(data);
    }

    private List<StudentTotalContext> buildProjectTotalContexts(ProjectSnapshot snapshot) {
        List<String> subjectIds = snapshot.projectSubjectsByName().values().stream()
                .flatMap(Collection::stream)
                .map(ExamSubject::getId)
                .distinct()
                .toList();
        if (subjectIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<ExamStudentScore> enteredScores = examStudentScoreRepository.findBySubjectIdIn(subjectIds).stream()
                .filter(this::isScoreEntered)
                .toList();
        List<ExamClass> examClasses = examClassRepository.findByProjectId(snapshot.project().getId());
        List<String> sourceClassIds = examClasses.stream()
                .map(ExamClass::getSourceClassId)
                .filter(StringUtils::hasText)
                .toList();
        Map<String, String> studentClassMap = (sourceClassIds.isEmpty() ? Collections.<SysStudent>emptyList() : studentRepository.findByClassIdIn(sourceClassIds)).stream()
                .filter(item -> StringUtils.hasText(item.getStudentNo()))
                .collect(Collectors.toMap(
                        SysStudent::getStudentNo,
                        item -> examClasses.stream()
                                .filter(examClass -> Objects.equals(item.getClassId(), examClass.getSourceClassId()))
                                .map(ExamClass::getId)
                                .findFirst()
                                .orElse(""),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Double> totalMap = new LinkedHashMap<>();
        for (ExamStudentScore score : enteredScores) {
            totalMap.merge(score.getStudentNo(), score.getTotalScore(), Double::sum);
        }
        return totalMap.entrySet().stream()
                .map(entry -> new StudentTotalContext(
                        entry.getKey(),
                        studentClassMap.getOrDefault(entry.getKey(), ""),
                        roundScore(entry.getValue())
                ))
                .toList();
    }

    private SegmentAnalysis buildSegmentAnalysis(String subject, List<Double> personalScores, List<Double> bestScores, List<Map<String, Object>> regions) {
        Map<String, double[]> typeStats = new LinkedHashMap<>(); // [myScore, maxScore]
        Map<String, double[]> kpStats = new LinkedHashMap<>();   // [myScore, maxScore]

        int count = Math.min(personalScores.size(), bestScores.size());
        for (int i = 0; i < count; i++) {
            double personal = personalScores.get(i) == null ? 0D : personalScores.get(i);
            double best = bestScores.get(i) == null ? 0D : bestScores.get(i);
            
            Map<String, Object> region = i < regions.size() ? regions.get(i) : Collections.emptyMap();
            String type = stringValue(region.get("questionType"));
            String kp = stringValue(region.get("knowledgePoint"));

            if (StringUtils.hasText(type)) {
                double[] stats = typeStats.computeIfAbsent(type, k -> new double[2]);
                stats[0] += personal;
                stats[1] += best;
            }
            if (StringUtils.hasText(kp)) {
                double[] stats = kpStats.computeIfAbsent(kp, k -> new double[2]);
                stats[0] += personal;
                stats[1] += best;
            }
        }

        List<Map<String, Object>> composition = new ArrayList<>();
        double weakest = 100D;
        String weakestName = "综合表现";

        for (Map.Entry<String, double[]> entry : typeStats.entrySet()) {
            double my = entry.getValue()[0];
            double max = entry.getValue()[1];
            double percent = max <= 0 ? 0D : (my / max) * 100D;
            percent = Math.max(0D, Math.min(100D, roundScore(percent)));

            if (percent < weakest) {
                weakest = percent;
                weakestName = entry.getKey();
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", entry.getKey());
            item.put("value", percent);
            item.put("level", masteryLevel(percent));
            item.put("color", masteryColor(percent));
            composition.add(item);
        }

        List<Map<String, Object>> knowledgePoints = new ArrayList<>();
        for (Map.Entry<String, double[]> entry : kpStats.entrySet()) {
            double my = entry.getValue()[0];
            double max = entry.getValue()[1];
            double percent = max <= 0 ? 0D : (my / max) * 100D;
            percent = Math.max(0D, Math.min(100D, roundScore(percent)));

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", entry.getKey());
            item.put("mastery", percent);
            item.put("status", masteryStatus(percent));
            knowledgePoints.add(item);
        }

        // 如果没有题型数据，回退到默认分段（以防万一）
        if (composition.isEmpty()) {
            return fallbackSegmentAnalysis(subject, personalScores, bestScores);
        }

        return new SegmentAnalysis(composition, knowledgePoints, weakestName, weakest);
    }

    private SegmentAnalysis fallbackSegmentAnalysis(String subject, List<Double> personalScores, List<Double> bestScores) {
        List<String> names = List.of("基础掌握", "能力理解", "综合运用", "提升突破");
        List<Map<String, Object>> composition = new ArrayList<>();
        
        int chunkSize = (int) Math.ceil(personalScores.size() / 4.0);
        for (int i = 0; i < 4; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, personalScores.size());
            if (start >= personalScores.size()) break;

            double my = personalScores.subList(start, end).stream().mapToDouble(d -> d == null ? 0D : d).sum();
            double max = bestScores.subList(start, end).stream().mapToDouble(d -> d == null ? 0D : d).sum();
            double percent = max <= 0 ? 60D : (my / max) * 100D;
            percent = Math.max(0D, Math.min(100D, roundScore(percent)));

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", names.get(i));
            item.put("value", percent);
            item.put("level", masteryLevel(percent));
            item.put("color", masteryColor(percent));
            composition.add(item);
        }

        return new SegmentAnalysis(composition, Collections.emptyList(), "基础掌握", 60D);
    }

    private String buildCompositionAnalysis(String subject, SegmentAnalysis analysis) {
        if (analysis.weakestValue() >= 90) {
            return String.format("本次%s考试表现极其出色，各维度掌握非常均衡。目前在“%s”维度仍保持领先优势，建议继续保持现有的学习节奏。", subject, analysis.weakestName());
        } else if (analysis.weakestValue() >= 75) {
            return String.format("本次%s成绩整体表现稳健，其中“%s”是相对薄弱的环节。建议在后续学习中加强该模块的专项练习，进一步提升稳定性。", subject, analysis.weakestName());
        } else {
            return String.format("本次%s考试反映出在“%s”方面存在较大提升空间。该环节的失分直接影响了整体表现，建议优先围绕该模块进行系统性的知识梳理。", subject, analysis.weakestName());
        }
    }

    private List<String> buildCompositionAdvice(String subject, SegmentAnalysis analysis) {
        List<String> advice = new ArrayList<>();
        String weakest = analysis.weakestName();
        
        advice.add(String.format("优先补强「%s」相关题型，建议连续7天进行同类题专项训练。", weakest));
        advice.add(String.format("将本次%s试卷中的失分题整理进错题本，重点复盘失分原因与解题步骤。", subject));
        
        if (analysis.weakestValue() < 60) {
            advice.add(String.format("针对「%s」模块的基础定义和公式进行重新梳理，确保不留知识盲点。", weakest));
        } else {
            advice.add("保持优势模块的日常巩固，每周至少完成2次限时练习，避免知识点回落。");
        }
        
        return advice;
    }

    private String buildTotalCompositionAnalysis(SegmentAnalysis analysis) {
        if (analysis.weakestValue() >= 90) {
            return String.format("本次总分表现非常稳健，各学科之间较为均衡。目前相对最弱的「%s」也保持了较高水准，整体发挥优秀。", analysis.weakestName());
        } else if (analysis.weakestValue() >= 75) {
            return String.format("本次总分结构较为健康，不过「%s」仍是当前提分空间最大的学科。后续若能优先补齐这部分短板，总分还有继续上探的空间。", analysis.weakestName());
        } else {
            return String.format("本次总分被「%s」明显拖累，该学科当前与优势学科之间存在较大差距。建议先缩小学科间落差，再追求整体突破。", analysis.weakestName());
        }
    }

    private List<String> buildTotalCompositionAdvice(SegmentAnalysis analysis) {
        List<String> advice = new ArrayList<>();
        advice.add(String.format("优先围绕「%s」开展专项提分训练，先把中档题和基础题稳定住。", analysis.weakestName()));
        advice.add("保持当前优势学科的题感和做题频率，避免在补弱过程中出现强项回落。");
        if (analysis.weakestValue() < 70) {
            advice.add(String.format("针对「%s」先做知识点梳理，再进行专题训练，避免直接刷综合题导致效率偏低。", analysis.weakestName()));
        } else {
            advice.add("建议每周做一次全科限时训练，重点观察总分构成和学科波动。");
        }
        return advice;
    }

    private List<Map<String, Object>> buildDistributionLevels(List<ExamStudentScore> scores, double fullScore) {
        List<ScoreBucket> buckets = List.of(
                new ScoreBucket("A", 0.9D, 1.01D, "linear-gradient(to top, #ff9a9e 0%, #fecfef 100%)"),
                new ScoreBucket("B", 0.8D, 0.9D, "linear-gradient(120deg, #f6d365 0%, #fda085 100%)"),
                new ScoreBucket("C", 0.7D, 0.8D, "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)"),
                new ScoreBucket("D", 0.6D, 0.7D, "linear-gradient(to top, #84fab0 0%, #8fd3f4 100%)"),
                new ScoreBucket("E", 0D, 0.6D, "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)")
        );

        List<Map<String, Object>> levels = new ArrayList<>();
        for (ScoreBucket bucket : buckets) {
            long count = scores.stream().filter(score -> {
                double ratio = fullScore <= 0 ? 0D : score.getTotalScore() / fullScore;
                return ratio >= bucket.min() && ratio < bucket.max();
            }).count();

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("level", bucket.name());
            item.put("count", count);
            item.put("label", bucketLabel(bucket, fullScore));
            item.put("color", bucket.color());
            levels.add(item);
        }
        return levels;
    }

    private List<Map<String, Object>> buildDistributionLevelsFromValues(List<Double> scores, double fullScore) {
        List<ScoreBucket> buckets = List.of(
                new ScoreBucket("A", 0.9D, 1.01D, "linear-gradient(to top, #ff9a9e 0%, #fecfef 100%)"),
                new ScoreBucket("B", 0.8D, 0.9D, "linear-gradient(120deg, #f6d365 0%, #fda085 100%)"),
                new ScoreBucket("C", 0.7D, 0.8D, "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)"),
                new ScoreBucket("D", 0.6D, 0.7D, "linear-gradient(to top, #84fab0 0%, #8fd3f4 100%)"),
                new ScoreBucket("E", 0D, 0.6D, "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)")
        );
        List<Map<String, Object>> levels = new ArrayList<>();
        for (ScoreBucket bucket : buckets) {
            long count = scores.stream().filter(score -> {
                double ratio = fullScore <= 0 ? 0D : score / fullScore;
                return ratio >= bucket.min() && ratio < bucket.max();
            }).count();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("level", bucket.name());
            item.put("count", count);
            item.put("label", bucketLabel(bucket, fullScore));
            item.put("color", bucket.color());
            levels.add(item);
        }
        return levels;
    }

    private String bucketLabel(ScoreBucket bucket, double fullScore) {
        int minScore = (int) Math.round(bucket.min() * fullScore);
        int maxScore = (int) Math.round(Math.min(fullScore, (bucket.max() * fullScore) - 1));
        if ("A".equals(bucket.name())) maxScore = (int) Math.round(fullScore);
        return minScore + "-" + maxScore;
    }

    private Map<String, Object> statItem(String name, double value, String icon, String compare) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("value", roundScore(value));
        item.put("icon", icon);
        item.put("compare", compare);
        return item;
    }

    private String calcMostVolatileSubject(List<Map<String, Object>> history, List<String> subjects) {
        String result = subjects.isEmpty() ? "总分" : subjects.get(0);
        double maxRange = -1D;
        for (String subject : subjects) {
            List<Double> values = history.stream()
                    .map(item -> ((Map<String, Double>) item.get("subjects")).getOrDefault(subject, 0D))
                    .toList();
            double range = values.stream().mapToDouble(Double::doubleValue).max().orElse(0D)
                    - values.stream().mapToDouble(Double::doubleValue).min().orElse(0D);
            if (range > maxRange) {
                maxRange = range;
                result = subject;
            }
        }
        return result;
    }

    private List<String> calcStrengthSubjects(Map<String, Double> averageMap, Map<String, Integer> sampleMap, List<String> subjects, boolean positive) {
        return subjects.stream()
                .sorted((a, b) -> {
                    double avgA = averageMap.getOrDefault(a, 0D) / Math.max(sampleMap.getOrDefault(a, 1), 1);
                    double avgB = averageMap.getOrDefault(b, 0D) / Math.max(sampleMap.getOrDefault(b, 1), 1);
                    return positive ? Double.compare(avgB, avgA) : Double.compare(avgA, avgB);
                })
                .limit(Math.min(2, subjects.size()))
                .toList();
    }

    private List<Map<String, Object>> buildMilestones(List<Map<String, Object>> history) {
        double best = history.stream().mapToDouble(item -> ((Number) item.get("score")).doubleValue()).max().orElse(0D);
        int bestRank = history.stream().mapToInt(item -> ((Number) item.get("rank")).intValue()).min().orElse(999);
        return List.of(
                milestoneItem("总分突破600", best >= 600 ? "completed" : "pending", best >= 600 ? "已达成" : "冲刺中"),
                milestoneItem("总分突破650", best >= 650 ? "completed" : "pending", best >= 650 ? "已达成" : "冲刺中"),
                milestoneItem("年级排名进入前50", bestRank <= 50 ? "completed" : "pending", bestRank <= 50 ? "已达成" : "冲刺中")
        );
    }

    private Map<String, Object> milestoneItem(String name, String status, String date) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("status", status);
        item.put("date", date);
        return item;
    }

    private Map<String, Object> buildTrendInsight(List<Map<String, Object>> history) {
        Map<String, Object> item = new LinkedHashMap<>();
        if (history.size() < 2) {
            item.put("text", "当前可用考试场次较少，建议继续补充历史成绩数据后查看更完整的趋势分析。");
            item.put("status", "positive");
            return item;
        }

        double latest = ((Number) history.get(history.size() - 1).get("score")).doubleValue();
        double previous = ((Number) history.get(history.size() - 2).get("score")).doubleValue();
        double diff = roundScore(latest - previous);
        item.put("text", diff >= 0
                ? "近六次考试整体呈上升趋势，最近一次较上次提升 " + diff + " 分，建议继续保持当前复习节奏。"
                : "近六次考试出现一定波动，最近一次较上次下降 " + Math.abs(diff) + " 分，建议优先检查薄弱学科与失误题型。");
        item.put("status", diff >= 0 ? "positive" : "negative");
        return item;
    }

    private String resolveSubject(List<ExamSubject> classSubjects, String subject) {
        if (StringUtils.hasText(subject)) return subject.trim();
        return classSubjects.isEmpty() ? "数学" : classSubjects.get(0).getSubjectName();
    }

    private boolean isTotalSubject(String subject) {
        return StringUtils.hasText(subject) && "总分".equals(subject.trim());
    }

    private ExamSubject findClassSubject(List<ExamSubject> classSubjects, String subject) {
        return classSubjects.stream()
                .filter(item -> equalsText(item.getSubjectName(), subject))
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> parseBenchmarks(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private double resolveFullScore(Map<String, Object> benchmarks, String subjectName) {
        Object raw = benchmarks.get(subjectName);
        if (raw instanceof Number number) return number.doubleValue();
        if (raw instanceof String text && StringUtils.hasText(text)) {
            try { return Double.parseDouble(text); } catch (Exception ignored) {}
        }
        if (raw instanceof Map<?, ?> map) {
            Object fullScore = map.get("fullScore");
            if (fullScore instanceof Number number) return number.doubleValue();
            Object totalScore = map.get("totalScore");
            if (totalScore instanceof Number number) return number.doubleValue();
            if (totalScore instanceof String text && StringUtils.hasText(text)) {
                try { return Double.parseDouble(text); } catch (Exception ignored) {}
            }
            Object score = map.get("score");
            if (score instanceof Number number) return number.doubleValue();
        }
        return DEFAULT_FULL_SCORES.getOrDefault(subjectName, 100D);
    }

    private List<Double> parseQuestionScores(String questionScores) {
        if (!StringUtils.hasText(questionScores)) return Collections.emptyList();
        try {
            return objectMapper.readValue(questionScores, new TypeReference<List<Double>>() {});
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private boolean isScoreEntered(ExamStudentScore score) {
        return score != null && Boolean.TRUE.equals(score.getScoreEntered());
    }

    private int calculateRank(List<ExamStudentScore> scores, double studentScore) {
        int rank = 1;
        for (ExamStudentScore score : scores.stream().sorted(Comparator.comparing(ExamStudentScore::getTotalScore).reversed()).toList()) {
            if (score.getTotalScore() > studentScore) rank++;
            else break;
        }
        return rank;
    }

    private int calculateRankFromTotals(List<StudentTotalContext> totals, String studentNo, double studentScore) {
        int rank = 1;
        for (StudentTotalContext total : totals.stream().sorted(Comparator.comparing(StudentTotalContext::totalScore).reversed()).toList()) {
            if (Objects.equals(total.studentNo(), studentNo)) {
                break;
            }
            if (total.totalScore() > studentScore) {
                rank++;
            } else {
                break;
            }
        }
        return rank;
    }

    private double average(List<Double> values) {
        if (values == null || values.isEmpty()) return 0D;
        return values.stream().mapToDouble(item -> item == null ? 0D : item).average().orElse(0D);
    }

    private String deriveSemesterLabel(ExamProject project) {
        String name = project.getName();
        if (!StringUtils.hasText(name)) return projectTime(project).getYear() + "学年";
        
        // 1. 如果名称中包含特定学期标识，截取到学期
        if (name.contains("第一学期") || name.contains("第二学期")) {
            return name.substring(0, name.indexOf("学期") + 2);
        }
        
        // 2. 如果包含“春季学期”或“秋季学期”，截取到该处
        if (name.contains("春季学期") || name.contains("秋季学期")) {
            int index = name.contains("春季学期") ? name.indexOf("春季学期") + 4 : name.indexOf("秋季学期") + 4;
            return name.substring(0, index);
        }
        
        // 3. 如果名称以年份开头，如 "2024年..."，截取年份
        if (name.matches("^\\d{4}年.*")) {
            return name.substring(0, 5) + "学年";
        }
        
        return projectTime(project).getYear() + "学年";
    }

    private LocalDateTime projectTime(ExamProject project) {
        if (project.getUpdateTime() != null) return project.getUpdateTime();
        if (project.getCreateTime() != null) return project.getCreateTime();
        return LocalDateTime.now();
    }

    private String formatProjectDate(ExamProject project) {
        return projectTime(project).format(DATE_TIME_FORMATTER);
    }

    private String masteryStatus(double percent) {
        if (percent >= 85) return "mastered";
        if (percent >= 65) return "warning";
        return "danger";
    }

    private String masteryLevel(double percent) {
        if (percent >= 90) return "优";
        if (percent >= 75) return "良";
        if (percent >= 60) return "中";
        return "弱";
    }

    private String masteryColor(double percent) {
        if (percent >= 85) return "#07c160";
        if (percent >= 65) return "#fa9d3b";
        return "#ee0a24";
    }

    private String compareText(double value) {
        double rounded = roundScore(value);
        return rounded >= 0 ? "+" + rounded : String.valueOf(rounded);
    }

    private Map<String, Object> subjectItem(String name, double score, double fullScore, String level) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("score", roundScore(score));
        item.put("fullScore", roundScore(fullScore));
        item.put("level", level);
        return item;
    }

    private List<Map<String, Object>> buildWrongQuestionRows(ProjectSnapshot snapshot, SysStudent student, String onlySubject) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ExamSubject classSubject : snapshot.classSubjects()) {
            String subjectName = classSubject.getSubjectName();
            if (StringUtils.hasText(onlySubject) && !equalsText(subjectName, onlySubject)) {
                continue;
            }
            Optional<ExamStudentScore> studentScoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(classSubject.getId(), student.getStudentNo());
            if (studentScoreOpt.isEmpty() || !isScoreEntered(studentScoreOpt.get())) {
                continue;
            }

            ExamStudentScore studentScore = studentScoreOpt.get();
            List<Double> personalScores = parseQuestionScores(studentScore.getQuestionScores());
            if (personalScores.isEmpty()) {
                continue;
            }

            List<ExamStudentScore> projectScores = findProjectSubjectScores(snapshot, subjectName);
            List<Double> bestScores = resolveBestQuestionScores(projectScores);
            List<Map<String, Object>> originalRegions = resolveSubjectRegions(classSubject, "original");
            List<Map<String, Object>> templateRegions = resolveSubjectRegions(classSubject, "template");
            List<Map<String, Object>> regions = alignRegionsToQuestionScores(
                    originalRegions,
                    Math.min(personalScores.size(), bestScores.size())
            );
            int questionCount = Math.min(personalScores.size(), bestScores.size());
            for (int index = 0; index < questionCount; index++) {
                double bestScore = bestScores.get(index);
                double personal = personalScores.get(index);
                if (bestScore <= 0 || personal >= bestScore) {
                    continue;
                }

                Map<String, Object> region = index < regions.size() ? regions.get(index) : Collections.emptyMap();
                String regionQuestionText = stringValue(region.get("questionText"));
                String regionQuestionNo = stringValue(region.get("questionNo"));
                String regionQuestionType = stringValue(region.get("questionType"));
                String regionKnowledgePoint = stringValue(region.get("knowledgePoint"));
                double mastery = bestScore <= 0 ? 0D : (personal / bestScore) * 100D;

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", snapshot.project().getId() + "_" + subjectName + "_" + (index + 1));
                row.put("subject", subjectName);
                row.put("time", formatProjectDate(snapshot.project()));
                row.put("source", snapshot.project().getName());
                row.put("questionNo", normalizeQuestionNo(regionQuestionNo, index + 1));
                row.put("question", StringUtils.hasText(regionQuestionText) ? regionQuestionText : "第" + (index + 1) + "题");
                row.put("knowledgePoint", regionKnowledgePoint);
                row.put("tags", buildWrongQuestionTags(regionKnowledgePoint, regionQuestionType));
                row.put("difficulty", buildDifficultyLabel(mastery));
                row.put("mastery", (int) Math.max(0, Math.min(100, Math.round(mastery))));
                row.put("myScore", roundScore(personal));
                row.put("highestScore", roundScore(bestScore));
                row.put("wrongReason", buildWrongReason(personal, bestScore));
                row.put("explanation", buildWrongExplanation(subjectName, index + 1, personal, bestScore));
                row.put("paperUrl", ossStorageService.toCdnUrl(studentScore.getAnswerSheetUrl()));
                row.put("paperRegion", buildPaperRegion(region, ossStorageService.toCdnUrl(studentScore.getAnswerSheetUrl())));
                
                // 优先从原卷中切割题目，如果没有原卷则回退到答题卡
                String sliceSourceUrl = StringUtils.hasText(classSubject.getPaperUrl()) ? classSubject.getPaperUrl() : studentScore.getAnswerSheetUrl();
                // 如果是从原卷切割，则 uniqueKey 不包含学生编号，以便在不同学生间复用切片
                String sliceUniqueKey = StringUtils.hasText(classSubject.getPaperUrl()) ? "common" : student.getStudentNo() + "_" + normalizeQuestionNo(regionQuestionNo, index + 1);

                row.put("sliceImageUrl", createQuestionSliceUrl(
                        sliceSourceUrl,
                        region,
                        snapshot.project().getId(),
                        subjectName,
                        "wrong",
                        sliceUniqueKey
                ));

                // 学生答案切片
                List<Map<String, Object>> studentRegions = resolveStudentRegions(studentScore);
                List<Map<String, Object>> targetStudentRegions = collectRegionsByQuestionNo(
                        StringUtils.hasText(studentScore.getAnswerSheetLayouts()) ? studentRegions : templateRegions,
                        regionQuestionNo
                );
                Map<String, Object> studentRegion = targetStudentRegions.isEmpty() ? Collections.emptyMap() : targetStudentRegions.get(0);
                row.put("studentAnswerSliceUrl", createQuestionSliceUrl(
                        studentScore.getAnswerSheetUrl(),
                        studentRegion,
                        snapshot.project().getId(),
                        subjectName,
                        "student_answer",
                        student.getStudentNo() + "_" + normalizeQuestionNo(regionQuestionNo, index + 1)
                ));

                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, Object>> buildPaperAnswers(ProjectSnapshot snapshot, ExamSubject classSubject, ExamStudentScore studentScore) {
        List<Double> personalScores = parseQuestionScores(studentScore.getQuestionScores());
        List<Map<String, Object>> rawRegions = resolveSubjectRegions(classSubject, "original");
        List<Map<String, Object>> templateRegions = resolveSubjectRegions(classSubject, "template");
        List<QuestionScoreContext> scoreContexts = buildQuestionScoreContexts(snapshot, classSubject.getSubjectName());

        int count = Math.max(personalScores.size(), Math.max(rawRegions.size(), resolveQuestionCount(scoreContexts)));
        List<Map<String, Object>> regions = alignRegionsToQuestionScores(rawRegions, count);
        List<Map<String, Object>> answers = new ArrayList<>();
        for (int index = 0; index < count; index++) {
            double personal = index < personalScores.size() ? personalScores.get(index) : 0D;
            Map<String, Object> region = index < regions.size() ? regions.get(index) : Collections.emptyMap();
            String questionNo = stringValue(region.get("questionNo"));
            String questionType = stringValue(region.get("questionType"));
            QuestionScoreMetrics metrics = buildQuestionScoreMetrics(scoreContexts, snapshot.examClass(), index);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("questionNo", normalizeQuestionNo(questionNo, index + 1));
            row.put("type", StringUtils.hasText(questionType) ? questionType : "题目");
            row.put("questionText", stringValue(region.get("questionText")));
            row.put("myScore", roundScore(personal));
            row.put("highestScore", roundScore(metrics.highestScore()));
            row.put("classAvgScore", roundScore(metrics.classAvgScore()));
            row.put("schoolAvgScore", roundScore(metrics.schoolAvgScore()));
            row.put("gradeAvgScore", roundScore(metrics.gradeAvgScore()));
            row.put("projectAvgScore", roundScore(metrics.projectAvgScore()));
            row.put("isBest", metrics.highestScore() > 0 && personal >= metrics.highestScore());

            // 学生答案区域
            List<Map<String, Object>> studentRegions = resolveStudentRegions(studentScore);
            List<Map<String, Object>> targetStudentRegions = collectRegionsByQuestionNo(
                    StringUtils.hasText(studentScore.getAnswerSheetLayouts()) ? studentRegions : templateRegions,
                    questionNo
            );
            Map<String, Object> studentRegion = targetStudentRegions.isEmpty() ? region : targetStudentRegions.get(0);
            row.put("paperRegion", buildPaperRegion(studentRegion, ossStorageService.toCdnUrl(studentScore.getAnswerSheetUrl())));
            answers.add(row);
        }
        return answers;
    }

    private List<Map<String, Object>> alignRegionsToQuestionScores(List<Map<String, Object>> regions, int questionCount) {
        if (questionCount <= 0) {
            return regions == null ? Collections.emptyList() : regions;
        }
        if (regions == null || regions.isEmpty()) {
            return Collections.nCopies(questionCount, Collections.emptyMap());
        }

        Map<Integer, Map<String, Object>> indexedRegions = new LinkedHashMap<>();
        List<Map<String, Object>> fallbackRegions = new ArrayList<>();
        for (Map<String, Object> region : regions) {
            Integer questionIndex = extractQuestionIndex(stringValue(region.get("questionNo")));
            if (questionIndex != null && questionIndex > 0) {
                indexedRegions.putIfAbsent(questionIndex, region);
            } else {
                fallbackRegions.add(region);
            }
        }

        List<Map<String, Object>> aligned = new ArrayList<>();
        for (int index = 1; index <= questionCount; index++) {
            Map<String, Object> region = indexedRegions.get(index);
            if (region == null && index - 1 < regions.size()) {
                region = regions.get(index - 1);
            }
            if (region == null && !fallbackRegions.isEmpty()) {
                region = fallbackRegions.remove(0);
            }
            aligned.add(region == null ? Collections.emptyMap() : region);
        }
        return aligned;
    }

    private List<String> collectPaperImages(String url) {
        if (!StringUtils.hasText(url)) {
            return Collections.emptyList();
        }
        
        // 支持逗号分隔的多个 URL
        if (url.contains(",")) {
            return Arrays.stream(url.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .map(ossStorageService::toCdnUrl)
                    .toList();
        }
        
        return List.of(ossStorageService.toCdnUrl(url.trim()));
    }

    private String buildTeacherComment(String subjectName, List<Map<String, Object>> answers) {
        long wrongCount = answers.stream()
                .filter(item -> !Boolean.TRUE.equals(item.get("isBest")))
                .count();
        if (wrongCount <= 0) {
            return subjectName + "本次表现稳定，当前题目掌握情况较好，继续保持。";
        }
        return subjectName + "本次共有 " + wrongCount + " 道题与同题最高分有差距，建议优先回看失分题对应步骤与计算细节。";
    }

    private List<String> buildWrongQuestionTags(String knowledgePoint, String questionType) {
        List<String> tags = new ArrayList<>();
        if (StringUtils.hasText(knowledgePoint)) {
            tags.add(knowledgePoint.trim());
        }
        if (StringUtils.hasText(questionType)) {
            tags.add(questionType.trim());
        }
        if (tags.isEmpty()) {
            tags.add("错题回顾");
        }
        return tags;
    }

    private String buildDifficultyLabel(double mastery) {
        if (mastery >= 80D) return "简单";
        if (mastery >= 50D) return "中等";
        return "困难";
    }

    private String buildWrongReason(double personal, double bestScore) {
        double gap = bestScore - personal;
        if (gap >= 8D) {
            return "与同题最高分差距较大，建议先补齐核心步骤。";
        }
        if (gap >= 3D) {
            return "本题存在关键得分点遗漏，可重点复盘解题过程。";
        }
        return "本题与最高分接近，建议检查细节和计算准确性。";
    }

    private String buildWrongExplanation(String subjectName, int questionIndex, double personal, double bestScore) {
        return subjectName + "第" + questionIndex + "题当前得分为 " + roundScore(personal)
                + " 分，同题最高分为 " + roundScore(bestScore)
                + " 分，建议结合原卷定位失分步骤后再做一次同类题巩固。";
    }

    private Map<String, Object> buildPaperRegion(Map<String, Object> region, String paperUrl) {
        if (region == null || region.isEmpty() || !StringUtils.hasText(paperUrl)) {
            return Collections.emptyMap();
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("imageUrl", paperUrl);
        payload.put("x", numberValue(region.get("x")));
        payload.put("y", numberValue(region.get("y")));
        payload.put("width", numberValue(region.get("width")));
        payload.put("height", numberValue(region.get("height")));
        payload.put("questionNo", stringValue(region.get("questionNo")));
        return payload;
    }

    private List<Map<String, Object>> resolveSubjectRegions(ExamSubject subject, String type) {
        if (subject == null || !StringUtils.hasText(type)) {
            return Collections.emptyList();
        }
        Object regionNode = readJsonValue("template".equals(type) ? subject.getAnswersLayouts() : subject.getPaperLayouts());
        if (!(regionNode instanceof Collection<?> collection)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : collection) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((key, value) -> row.put(String.valueOf(key), value));
                rows.add(row);
            }
        }
        return rows;
    }

    private Object readJsonValue(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private List<QuestionScoreContext> buildQuestionScoreContexts(ProjectSnapshot snapshot, String subjectName) {
        List<ExamSubject> projectSubjects = snapshot.projectSubjectsByName().getOrDefault(subjectName, Collections.emptyList());
        if (projectSubjects.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, ExamClass> classMap = examClassRepository.findByProjectId(snapshot.project().getId()).stream()
                .collect(Collectors.toMap(ExamClass::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        List<String> subjectIds = projectSubjects.stream().map(ExamSubject::getId).toList();
        Map<String, ExamClass> studentClassMap = classMap.values().stream()
                .filter(item -> StringUtils.hasText(item.getSourceClassId()))
                .flatMap(item -> studentRepository.findByClassIdIn(List.of(item.getSourceClassId())).stream()
                        .filter(student -> StringUtils.hasText(student.getStudentNo()))
                        .map(student -> Map.entry(student.getStudentNo(), item)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        return examStudentScoreRepository.findBySubjectIdIn(subjectIds).stream()
                .filter(this::isScoreEntered)
                .map(score -> {
                    ExamClass examClass = studentClassMap.get(score.getStudentNo());
                    String classId = examClass == null ? "" : examClass.getId();
                    return new QuestionScoreContext(
                            classId == null ? "" : classId,
                            examClass == null ? "" : stringValue(examClass.getSchoolId()),
                            examClass == null ? "" : stringValue(examClass.getGrade()),
                            parseQuestionScores(score.getQuestionScores())
                    );
                })
                .toList();
    }

    private int resolveQuestionCount(List<QuestionScoreContext> contexts) {
        return contexts.stream()
                .mapToInt(item -> item.questionScores() == null ? 0 : item.questionScores().size())
                .max()
                .orElse(0);
    }

    private QuestionScoreMetrics buildQuestionScoreMetrics(
            List<QuestionScoreContext> contexts,
            ExamClass currentClass,
            int questionIndex) {
        List<Double> projectScores = collectQuestionScores(contexts, questionIndex, null, null, null);
        List<Double> classScores = collectQuestionScores(contexts, questionIndex, stringValue(currentClass.getId()), null, null);
        List<Double> schoolScores = collectQuestionScores(contexts, questionIndex, null, stringValue(currentClass.getSchoolId()), null);
        List<Double> gradeScores = collectQuestionScores(contexts, questionIndex, null, null, stringValue(currentClass.getGrade()));
        double highestScore = projectScores.stream().mapToDouble(Double::doubleValue).max().orElse(0D);
        return new QuestionScoreMetrics(
                highestScore,
                average(classScores),
                average(schoolScores),
                average(gradeScores),
                average(projectScores)
        );
    }

    private List<Double> collectQuestionScores(
            List<QuestionScoreContext> contexts,
            int questionIndex,
            String classId,
            String schoolId,
            String grade) {
        return contexts.stream()
                .filter(item -> !StringUtils.hasText(classId) || classId.equals(item.classId()))
                .filter(item -> !StringUtils.hasText(schoolId) || schoolId.equals(item.schoolId()))
                .filter(item -> !StringUtils.hasText(grade) || grade.equals(item.grade()))
                .filter(item -> item.questionScores() != null && item.questionScores().size() > questionIndex)
                .map(item -> item.questionScores().get(questionIndex))
                .filter(Objects::nonNull)
                .toList();
    }

    private String createQuestionSliceUrl(
            String sourceUrl,
            Map<String, Object> region,
            String projectId,
            String subjectName,
            String category,
            String uniqueKey) {
        if (!StringUtils.hasText(sourceUrl) || region == null || region.isEmpty()) {
            return "";
        }
        Path tempPath = null;
        try {
            tempPath = resolvePaperPath(sourceUrl);
            if (tempPath == null || !Files.exists(tempPath)) {
                return "";
            }
            BufferedImage image = ImageIO.read(tempPath.toFile());
            if (image == null) {
                return "";
            }

            double xRatio = clampRatio(numberValue(region.get("x")));
            double yRatio = clampRatio(numberValue(region.get("y")));
            double widthRatio = clampRatio(numberValue(region.get("width")));
            double heightRatio = clampRatio(numberValue(region.get("height")));
            int x = Math.min((int) Math.floor(xRatio * image.getWidth()), Math.max(image.getWidth() - 1, 0));
            int y = Math.min((int) Math.floor(yRatio * image.getHeight()), Math.max(image.getHeight() - 1, 0));
            int width = Math.max((int) Math.ceil(widthRatio * image.getWidth()), 1);
            int height = Math.max((int) Math.ceil(heightRatio * image.getHeight()), 1);
            width = Math.min(width, image.getWidth() - x);
            height = Math.min(height, image.getHeight() - y);
            if (width <= 0 || height <= 0) {
                return "";
            }

            String questionNo = normalizeQuestionNo(stringValue(region.get("questionNo")), 1);
            String hash = Integer.toHexString((sourceUrl + "|" + xRatio + "|" + yRatio + "|" + widthRatio + "|" + heightRatio).hashCode());
            String fileName = safePathSegment(category) + "_" + safePathSegment(uniqueKey) + "_q" + questionNo + "_" + hash + ".png";
            
            String objectKey = "papers/exam-projects/"
                    + safePathSegment(projectId) + "/"
                    + safePathSegment(subjectName) + "/slices/"
                    + fileName;

            BufferedImage cropped = image.getSubimage(x, y, width, height);
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            ImageIO.write(cropped, "png", baos);
            return ossStorageService.uploadBytes(baos.toByteArray(), objectKey, "image/png");
        } catch (Exception ignored) {
            return "";
        } finally {
            if (tempPath != null && ossStorageService.isOssUrl(sourceUrl)) {
                try { Files.deleteIfExists(tempPath); } catch (Exception ignored) {}
            }
        }
    }

    private Path resolvePaperPath(String url) {
        if (!StringUtils.hasText(url)) return null;
        if (ossStorageService.isOssUrl(url)) {
            try {
                return ossStorageService.downloadToTempFile(url);
            } catch (Exception e) {
                return null;
            }
        }
        if (url.startsWith("/uploads/papers/")) {
            Path paperRoot = Paths.get(globalConfigProperties.getPaperDir()).toAbsolutePath().normalize();
            Path resolvedPath = paperRoot.resolve(url.substring("/uploads/papers/".length())).normalize();
            if (resolvedPath.startsWith(paperRoot)) {
                return resolvedPath;
            }
        }
        return null;
    }

    private String safePathSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "unknown";
        }
        return value.trim().replaceAll("[\\\\/:*?\"<>|\\s]+", "_");
    }

    private double clampRatio(double value) {
        if (Double.isNaN(value)) {
            return 0D;
        }
        return Math.max(0D, Math.min(1D, value));
    }

    private List<Double> resolveBestQuestionScores(List<ExamStudentScore> scores) {
        List<Double> bestScores = new ArrayList<>();
        for (ExamStudentScore score : scores) {
            List<Double> values = parseQuestionScores(score.getQuestionScores());
            for (int index = 0; index < values.size(); index++) {
                double current = values.get(index) == null ? 0D : values.get(index);
                if (index >= bestScores.size()) {
                    bestScores.add(current);
                } else if (current > bestScores.get(index)) {
                    bestScores.set(index, current);
                }
            }
        }
        return bestScores;
    }

    private Map<String, Object> parseJsonMap(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private double numberValue(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value != null && StringUtils.hasText(String.valueOf(value))) {
            try {
                return Double.parseDouble(String.valueOf(value));
            } catch (Exception ignored) {
                return 0D;
            }
        }
        return 0D;
    }

    private String normalizeQuestionNo(String raw, int fallback) {
        if (!StringUtils.hasText(raw)) {
            return String.valueOf(fallback);
        }
        String normalized = raw.replaceAll("[^0-9]", "");
        return StringUtils.hasText(normalized) ? normalized : String.valueOf(fallback);
    }

    private Integer extractQuestionIndex(String questionNo) {
        String normalized = normalizeQuestionNo(questionNo, 0);
        Matcher matcher = QUESTION_NUMBER_PATTERN.matcher(normalized);
        if (!matcher.find()) {
            return null;
        }
        return parseIntSafe(matcher.group(1));
    }

    private Integer parseIntSafe(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
