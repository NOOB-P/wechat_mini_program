package com.edu.javasb_back.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.Result;
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
import com.edu.javasb_back.service.ScoreService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ScoreServiceImpl implements ScoreService {

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
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        List<ProjectSnapshot> snapshots = buildProjectSnapshots(studentOpt.get());
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无成绩构成分析数据");

        String targetSubject = resolveSubject(snapshot.classSubjects(), subject);
        ExamSubject classSubject = findClassSubject(snapshot.classSubjects(), targetSubject);
        if (classSubject == null) return Result.error("未找到对应学科成绩");

        Optional<ExamStudentScore> studentScoreOpt = examStudentScoreRepository.findBySubjectIdAndStudentNo(classSubject.getId(), studentOpt.get().getStudentNo());
        if (studentScoreOpt.isEmpty()) return Result.error("暂无该学科成绩数据");

        ExamStudentScore studentScore = studentScoreOpt.get();
        double fullScore = resolveFullScore(snapshot.benchmarks(), targetSubject);
        List<ExamStudentScore> scoreList = findProjectSubjectScores(snapshot, targetSubject);
        SegmentAnalysis segmentAnalysis = buildSegmentAnalysis(targetSubject, parseQuestionScores(studentScore.getQuestionScores()), fullScore);

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
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        ProjectSnapshot snapshot = resolveSnapshot(snapshots, examId);
        if (snapshot == null) return Result.error("暂无分数分布数据");

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
        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) return Result.error("未绑定学生账号");

        SysStudent student = studentOpt.get();
        List<ProjectSnapshot> snapshots = buildProjectSnapshots(student);
        if (snapshots.isEmpty()) return Result.error("暂无趋势分析数据");

        List<ProjectSnapshot> trendSnapshots = pickTrendSnapshots(snapshots, examId);
        List<Map<String, Object>> history = new ArrayList<>();
        
        // 提前预加载所有可能需要的成绩数据，减少循环内的数据库查询
        List<String> allClassIds = trendSnapshots.stream().map(s -> s.examClass().getId()).collect(Collectors.toList());
        List<ExamSubject> allTrendSubjects = examSubjectRepository.findByClassIdIn(allClassIds);
        Map<String, List<ExamSubject>> subjectsByClassId = allTrendSubjects.stream()
                .collect(Collectors.groupingBy(ExamSubject::getClassId));

        Set<String> uniqueSubjectNames = new TreeSet<>();

        for (ProjectSnapshot snapshot : trendSnapshots) {
            try {
                ProjectAggregate aggregate = buildFastProjectAggregate(snapshot, student, subjectsByClassId.getOrDefault(snapshot.examClass().getId(), Collections.emptyList()));
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

        List<ExamSubject> classSubjects = examSubjectRepository.findByClassId(matchedClass.getId());
        if (classSubjects.isEmpty()) return null;

        boolean hasStudentScore = classSubjects.stream()
                .map(ExamSubject::getId)
                .map(studentScoreMap::get)
                .anyMatch(this::isScoreEntered);
        if (!hasStudentScore) return null;

        List<ExamSubject> projectSubjects = examSubjectRepository.findByClassIdIn(
                examClasses.stream().map(ExamClass::getId).toList()
        );
        Map<String, List<ExamSubject>> projectSubjectsByName = projectSubjects.stream()
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
        return Result.success(data);
    }

    private SegmentAnalysis buildSegmentAnalysis(String subject, List<Double> questionScores, double fullScore) {
        List<String> names = KNOWLEDGE_POINT_MAP.getOrDefault(subject, List.of("基础掌握", "能力理解", "综合运用", "提升突破"));
        List<Double> percentages = splitToPercentages(questionScores, fullScore);
        List<Map<String, Object>> composition = new ArrayList<>();
        List<Map<String, Object>> knowledgePoints = new ArrayList<>();
        double weakest = 100D;
        String weakestName = names.get(0);

        for (int i = 0; i < names.size(); i++) {
            double percent = percentages.get(i);
            if (percent < weakest) {
                weakest = percent;
                weakestName = names.get(i);
            }

            Map<String, Object> compItem = new LinkedHashMap<>();
            compItem.put("name", names.get(i));
            compItem.put("value", roundScore(percent));
            compItem.put("level", masteryLevel(percent));
            compItem.put("color", masteryColor(percent));
            composition.add(compItem);

            Map<String, Object> kpItem = new LinkedHashMap<>();
            kpItem.put("name", names.get(i));
            kpItem.put("mastery", roundScore(percent));
            kpItem.put("status", masteryStatus(percent));
            knowledgePoints.add(kpItem);
        }

        return new SegmentAnalysis(composition, knowledgePoints, weakestName, weakest);
    }

    private List<Double> splitToPercentages(List<Double> questionScores, double fullScore) {
        if (questionScores == null || questionScores.isEmpty()) {
            return List.of(88D, 82D, 76D, 68D);
        }

        int chunkCount = 4;
        int chunkSize = (int) Math.ceil(questionScores.size() / (double) chunkCount);
        double chunkFullScore = fullScore / chunkCount;
        List<Double> values = new ArrayList<>();
        for (int i = 0; i < chunkCount; i++) {
            int fromIndex = i * chunkSize;
            int toIndex = Math.min(fromIndex + chunkSize, questionScores.size());
            if (fromIndex >= toIndex) {
                values.add(60D);
                continue;
            }
            double chunkScore = questionScores.subList(fromIndex, toIndex).stream().mapToDouble(item -> item == null ? 0D : item).sum();
            double percent = chunkFullScore <= 0 ? 0D : (chunkScore / chunkFullScore) * 100D;
            values.add(Math.max(0D, Math.min(100D, roundScore(percent))));
        }
        while (values.size() < 4) {
            values.add(values.get(values.size() - 1));
        }
        return values;
    }

    private String buildCompositionAnalysis(String subject, SegmentAnalysis analysis) {
        return String.format(Locale.ROOT,
                "本次%s成绩整体表现稳定，其中“%s”是当前最需要加强的环节。建议优先围绕该模块做专题训练，并结合错题回顾提升解题稳定性。",
                subject, analysis.weakestName());
    }

    private List<String> buildCompositionAdvice(String subject, SegmentAnalysis analysis) {
        return List.of(
                "优先补强「" + analysis.weakestName() + "」，建议连续 7 天进行同类题专项训练。",
                "将本次 " + subject + " 试卷中的失分题整理进错题本，重点复盘失分原因与解题步骤。",
                "保持优势模块的日常巩固，每周至少完成 2 次限时练习，避免知识点回落。"
        );
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

    private double average(List<Double> values) {
        if (values == null || values.isEmpty()) return 0D;
        return values.stream().mapToDouble(item -> item == null ? 0D : item).average().orElse(0D);
    }

    private String deriveSemesterLabel(ExamProject project) {
        String name = project.getName();
        if (!StringUtils.hasText(name)) return projectTime(project).getYear() + "学年";
        if (name.contains("第一学期") || name.contains("第二学期")) {
            return name.substring(0, name.indexOf("学期") + 2);
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
}
