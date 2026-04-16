package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.model.entity.ExamStudentScore;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.repository.ExamProjectRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.ExamAnalysisService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExamAnalysisServiceImpl implements ExamAnalysisService {

    private static final double PROJECT_PASS_RATE = 0.6D;
    private static final double PROJECT_EXCELLENT_RATE = 0.8D;
    private static final double PROJECT_LOW_RATE = 0.4D;
    private static final double CLASS_PASS_RATE = 0.7D;
    private static final double CLASS_EXCELLENT_RATE = 0.8D;
    private static final double CLASS_HIGH_RATE = 0.9D;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ExamProjectRepository examProjectRepository;
    @Autowired
    private ExamClassRepository examClassRepository;
    @Autowired
    private ExamSubjectRepository examSubjectRepository;
    @Autowired
    private ExamStudentScoreRepository examStudentScoreRepository;
    @Autowired
    private SysStudentRepository sysStudentRepository;
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public Result<Map<String, Object>> getAnalysisProjectList(String name) {
        List<Map<String, Object>> records = examProjectRepository.findAll(Sort.by(Sort.Direction.DESC, "createTime")).stream()
                .filter(project -> !StringUtils.hasText(name) || containsIgnoreCase(project.getName(), name))
                .map(this::projectBase)
                .toList();
        return Result.success("获取成功", Map.of("records", records, "total", records.size()));
    }

    @Override
    public Result<Map<String, Object>> getProjectDashboard(String projectId) {
        AnalysisCtx ctx = buildCtx(projectId);
        if (!ctx.ok()) return Result.error(ctx.msg());

        MetricSnapshot metric = metricSnapshot(ctx.students(), PROJECT_PASS_RATE, PROJECT_EXCELLENT_RATE, PROJECT_LOW_RATE, 0D);
        List<Map<String, Object>> schoolRanking = ctx.students().stream()
                .collect(Collectors.groupingBy(StudentSummary::schoolId, LinkedHashMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(entry -> rankingRow(entry.getValue().get(0).schoolName(), entry.getValue(), PROJECT_PASS_RATE, PROJECT_EXCELLENT_RATE, PROJECT_LOW_RATE, 0D))
                .sorted(Comparator.comparing((Map<String, Object> item) -> asDouble(item.get("avgScore"))).reversed())
                .limit(10)
                .toList();
        List<Map<String, Object>> classRanking = ctx.students().stream()
                .collect(Collectors.groupingBy(StudentSummary::classExamId, LinkedHashMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(entry -> {
                    ExamClass examClass = ctx.classMap().get(entry.getKey());
                    String label = examClass == null ? "" : examClass.getSchool() + " " + examClass.getGrade() + examClass.getClassName();
                    return rankingRow(label, entry.getValue(), PROJECT_PASS_RATE, PROJECT_EXCELLENT_RATE, PROJECT_LOW_RATE, 0D);
                })
                .sorted(Comparator.comparing((Map<String, Object> item) -> asDouble(item.get("avgScore"))).reversed())
                .limit(10)
                .toList();
        List<Map<String, Object>> subjectPassRates = ctx.subjectNames().stream()
                .map(subjectName -> {
                    List<ExamStudentScore> subjectScores = ctx.scoresBySubjectName().getOrDefault(subjectName, Collections.emptyList());
                    double fullScore = subjectFullScore(ctx, subjectName, subjectScores);
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("subjectName", subjectName);
                    item.put("passRate", round(rateCount(subjectScores.stream().map(this::scoreValue).toList(), fullScore * PROJECT_PASS_RATE)));
                    return item;
                }).toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("project", projectBase(ctx.project()));
        data.put("coreMetrics", List.of(
                metricCard("平均分", round(metric.avgScore()), "", "#409EFF"),
                metricCard("优秀率", round(metric.excellentRate()), "%", "#67C23A"),
                metricCard("及格率", round(metric.passRate()), "%", "#E6A23C"),
                metricCard("低分率", round(metric.lowRate()), "%", "#F56C6C")
        ));
        data.put("scoreDistribution", buildDistributionRows(ctx.students().stream().map(StudentSummary::totalScore).toList(), 6));
        data.put("subjectPassRates", subjectPassRates);
        data.put("schoolRanking", schoolRanking);
        data.put("classRanking", classRanking);
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getClassSelectData(String projectId) {
        AnalysisCtx ctx = buildCtx(projectId);
        if (!ctx.ok()) return Result.error(ctx.msg());

        List<Map<String, Object>> schools = ctx.classes().stream()
                .collect(Collectors.groupingBy(ExamClass::getSchoolId, LinkedHashMap::new, Collectors.toList()))
                .values().stream()
                .map(items -> {
                    ExamClass first = items.get(0);
                    List<Map<String, Object>> classes = items.stream().map(item -> {
                        List<StudentSummary> rows = ctx.studentsByClass().getOrDefault(item.getId(), Collections.emptyList());
                        MetricSnapshot metric = metricSnapshot(rows, CLASS_PASS_RATE, CLASS_EXCELLENT_RATE, 0D, CLASS_HIGH_RATE);
                        Map<String, Object> cls = new LinkedHashMap<>();
                        cls.put("id", item.getId());
                        cls.put("name", item.getGrade() + item.getClassName());
                        cls.put("studentCount", rows.size());
                        cls.put("avgScore", round(metric.avgScore()));
                        cls.put("passRate", round(metric.passRate()));
                        return cls;
                    }).toList();
                    Map<String, Object> school = new LinkedHashMap<>();
                    school.put("id", first.getSchoolId());
                    school.put("name", first.getSchool());
                    school.put("classes", classes);
                    return school;
                }).toList();

        return Result.success("获取成功", Map.of("project", projectBase(ctx.project()), "schools", schools));
    }

    @Override
    public Result<Map<String, Object>> getClassDashboard(String projectId, String classId) {
        AnalysisCtx ctx = buildCtx(projectId);
        if (!ctx.ok()) return Result.error(ctx.msg());
        ExamClass examClass = ctx.classMap().get(classId);
        if (examClass == null) return Result.error("班级不存在");

        List<StudentSummary> classStudents = ctx.studentsByClass().getOrDefault(classId, Collections.emptyList());
        MetricSnapshot metric = metricSnapshot(classStudents, CLASS_PASS_RATE, CLASS_EXCELLENT_RATE, 0D, CLASS_HIGH_RATE);
        List<Map<String, Object>> schoolClassRows = ctx.classes().stream()
                .filter(item -> examClass.getSchoolId().equals(item.getSchoolId()))
                .map(item -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("classId", item.getId());
                    row.put("metric", metricSnapshot(ctx.studentsByClass().getOrDefault(item.getId(), Collections.emptyList()), CLASS_PASS_RATE, CLASS_EXCELLENT_RATE, 0D, CLASS_HIGH_RATE));
                    return row;
                })
                .toList();

        Map<String, Integer> avgRank = rankMap(schoolClassRows, "classId", row -> ((MetricSnapshot) row.get("metric")).avgScore());
        Map<String, Integer> passRank = rankMap(schoolClassRows, "classId", row -> ((MetricSnapshot) row.get("metric")).passRate());
        Map<String, Integer> excellentRank = rankMap(schoolClassRows, "classId", row -> ((MetricSnapshot) row.get("metric")).excellentRate());
        Map<String, Integer> highRank = rankMap(schoolClassRows, "classId", row -> ((MetricSnapshot) row.get("metric")).highRate());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("project", projectBase(ctx.project()));
        data.put("classInfo", Map.of("id", examClass.getId(), "schoolId", examClass.getSchoolId(), "schoolName", examClass.getSchool(), "className", examClass.getGrade() + examClass.getClassName()));
        data.put("statsCards", List.of(
                rankMetricCard("平均分", round(metric.avgScore()), "分", avgRank.getOrDefault(classId, 0), "avg"),
                rankMetricCard("及格率", round(metric.passRate()), "%", passRank.getOrDefault(classId, 0), "pass"),
                rankMetricCard("优秀率", round(metric.excellentRate()), "%", excellentRank.getOrDefault(classId, 0), "excel"),
                rankMetricCard("高分率", round(metric.highRate()), "%", highRank.getOrDefault(classId, 0), "top")
        ));
        data.put("scoreSeries", classStudents.stream().sorted(Comparator.comparing(StudentSummary::totalScore).reversed()).map(item -> {
            Map<String, Object> series = new LinkedHashMap<>();
            series.put("studentNo", item.studentNo());
            series.put("studentName", item.studentName());
            series.put("totalScore", round(item.totalScore()));
            return series;
        }).toList());
        data.put("scoreDistribution", buildDistributionRows(classStudents.stream().map(StudentSummary::totalScore).toList(), 4));
        data.put("subjectColumns", ctx.subjectNames().stream().map(name -> {
            Map<String, Object> col = new HashMap<>();
            col.put("key", name);
            col.put("label", name);
            return col;
        }).toList());
        data.put("students", buildClassStudentRows(ctx, classStudents, examClass.getSchoolId()));
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getStudentReport(String projectId, String classId, String studentNo) {
        AnalysisCtx ctx = buildCtx(projectId);
        if (!ctx.ok()) return Result.error(ctx.msg());
        ExamClass examClass = ctx.classMap().get(classId);
        if (examClass == null) return Result.error("班级不存在");
        StudentSummary student = ctx.studentByClassAndNo().get(classId + "#" + studentNo);
        if (student == null) return Result.error("学生不存在");

        Map<String, Integer> classRank = studentRankMap(ctx.studentsByClass().getOrDefault(classId, Collections.emptyList()));
        Map<String, Integer> schoolRank = studentRankMap(ctx.studentsBySchool().getOrDefault(examClass.getSchoolId(), Collections.emptyList()));
        List<Map<String, Object>> subjectStats = ctx.subjectNames().stream()
                .map(subject -> buildSubjectSnapshot(ctx, examClass, student, subject))
                .filter(item -> item != null)
                .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("project", projectBase(ctx.project()));
        data.put("student", Map.of("studentNo", student.studentNo(), "studentName", student.studentName(), "schoolName", student.schoolName(), "className", student.classDisplay()));
        data.put("overview", Map.of("totalScore", round(student.totalScore()), "classRank", classRank.getOrDefault(student.studentNo(), 0), "schoolRank", schoolRank.getOrDefault(student.studentNo(), 0)));
        data.put("statusCards", List.of(
                thresholdStatusCard("及格状态", student.totalScore(), student.totalFullScore(), PROJECT_PASS_RATE, "pass", "已及格", "未及格"),
                thresholdStatusCard("优秀状态", student.totalScore(), student.totalFullScore(), PROJECT_EXCELLENT_RATE, "excel", "已优秀", "未优秀"),
                criticalStatusCard(student.totalScore(), student.totalFullScore())
        ));
        data.put("subjectStats", subjectStats);
        data.put("wrongQuestions", buildWrongQuestions(ctx, examClass, student, null));
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getStudentSubjectReport(String projectId, String classId, String studentNo, String subjectName) {
        AnalysisCtx ctx = buildCtx(projectId);
        if (!ctx.ok()) return Result.error(ctx.msg());
        ExamClass examClass = ctx.classMap().get(classId);
        if (examClass == null) return Result.error("班级不存在");
        StudentSummary student = ctx.studentByClassAndNo().get(classId + "#" + studentNo);
        if (student == null) return Result.error("学生不存在");

        Map<String, Object> detail = buildSubjectSnapshot(ctx, examClass, student, subjectName);
        if (detail == null) return Result.error("该学生暂无此学科成绩");

        List<Double> classScores = ctx.subjectScoresByClassAndName().getOrDefault(classId + "#" + subjectName, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("project", projectBase(ctx.project()));
        data.put("student", Map.of("studentNo", student.studentNo(), "studentName", student.studentName(), "schoolName", student.schoolName(), "className", student.classDisplay()));
        data.put("subjectName", subjectName);
        data.put("subjectDetail", detail);
        data.put("scoreDistribution", buildDistributionRows(classScores, 4));
        data.put("knowledgeRates", buildKnowledgeRates(ctx, examClass, student, subjectName));
        data.put("wrongQuestions", buildWrongQuestions(ctx, examClass, student, subjectName));
        return Result.success("获取成功", data);
    }

    private AnalysisCtx buildCtx(String projectId) {
        ExamProject project = examProjectRepository.findById(projectId).orElse(null);
        if (project == null) return AnalysisCtx.fail("项目不存在");

        List<ExamClass> classes = examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(projectId);
        if (classes.isEmpty()) return AnalysisCtx.fail("项目下暂无班级数据");

        List<String> examClassIds = classes.stream().map(ExamClass::getId).toList();
        List<ExamSubject> subjects = examSubjectRepository.findByClassIdInOrderBySubjectNameAsc(examClassIds);
        Map<String, ExamClass> classMap = classes.stream().collect(Collectors.toMap(ExamClass::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        Map<String, List<ExamSubject>> subjectsByClass = subjects.stream().collect(Collectors.groupingBy(ExamSubject::getClassId, LinkedHashMap::new, Collectors.toList()));
        Map<String, ExamSubject> subjectByClassAndName = subjects.stream().collect(Collectors.toMap(
                item -> item.getClassId() + "#" + item.getSubjectName(),
                item -> item,
                (a, b) -> a,
                LinkedHashMap::new
        ));

        List<String> subjectIds = subjects.stream().map(ExamSubject::getId).toList();
        List<ExamStudentScore> enteredScores = subjectIds.isEmpty() ? Collections.emptyList() : examStudentScoreRepository.findBySubjectIdIn(subjectIds).stream()
                .filter(this::isEnteredScore)
                .toList();
        Map<String, List<ExamStudentScore>> scoresBySubjectId = enteredScores.stream().collect(Collectors.groupingBy(ExamStudentScore::getSubjectId, LinkedHashMap::new, Collectors.toList()));
        Map<String, List<ExamStudentScore>> scoresBySubjectName = subjects.stream().collect(Collectors.groupingBy(
                ExamSubject::getSubjectName,
                LinkedHashMap::new,
                Collectors.collectingAndThen(Collectors.toList(), list -> list.stream().flatMap(item -> scoresBySubjectId.getOrDefault(item.getId(), Collections.emptyList()).stream()).toList())
        ));

        List<String> sourceClassIds = classes.stream().map(ExamClass::getSourceClassId).filter(StringUtils::hasText).distinct().toList();
        Map<String, List<SysStudent>> studentsBySourceClass = (sourceClassIds.isEmpty() ? Collections.<SysStudent>emptyList() : sysStudentRepository.findByClassIdIn(sourceClassIds))
                .stream().collect(Collectors.groupingBy(SysStudent::getClassId, LinkedHashMap::new, Collectors.toList()));

        Map<String, SubjectBenchmark> benchmarks = parseBenchmarks(project.getSubjectBenchmarks());
        List<StudentSummary> students = new ArrayList<>();
        for (ExamClass examClass : classes) {
            List<SysStudent> classStudents = studentsBySourceClass.getOrDefault(examClass.getSourceClassId(), Collections.emptyList());
            Map<String, ExamStudentScore> scoreMap = new HashMap<>();
            for (ExamSubject subject : subjectsByClass.getOrDefault(examClass.getId(), Collections.emptyList())) {
                for (ExamStudentScore score : scoresBySubjectId.getOrDefault(subject.getId(), Collections.emptyList())) {
                    scoreMap.put(subject.getSubjectName() + "#" + score.getStudentNo(), score);
                }
            }
            for (SysStudent sysStudent : classStudents) {
                LinkedHashMap<String, Double> subjectScores = new LinkedHashMap<>();
                LinkedHashMap<String, Double> subjectFullScores = new LinkedHashMap<>();
                for (ExamSubject subject : subjectsByClass.getOrDefault(examClass.getId(), Collections.emptyList())) {
                    ExamStudentScore score = scoreMap.get(subject.getSubjectName() + "#" + sysStudent.getStudentNo());
                    if (score == null) continue;
                    subjectScores.put(subject.getSubjectName(), scoreValue(score));
                    subjectFullScores.put(subject.getSubjectName(), subjectFullScore(benchmarks, subject.getSubjectName(), scoresBySubjectName.getOrDefault(subject.getSubjectName(), Collections.emptyList()), score));
                }
                if (subjectScores.isEmpty()) continue;
                students.add(new StudentSummary(sysStudent.getStudentNo(), sysStudent.getName(), examClass.getSchoolId(), examClass.getSchool(), examClass.getId(), examClass.getGrade() + examClass.getClassName(), subjectScores, subjectFullScores));
            }
        }

        Map<String, List<StudentSummary>> studentsByClass = students.stream().collect(Collectors.groupingBy(StudentSummary::classExamId, LinkedHashMap::new, Collectors.toList()));
        Map<String, List<StudentSummary>> studentsBySchool = students.stream().collect(Collectors.groupingBy(StudentSummary::schoolId, LinkedHashMap::new, Collectors.toList()));
        Map<String, StudentSummary> studentByClassAndNo = students.stream().collect(Collectors.toMap(item -> item.classExamId() + "#" + item.studentNo(), item -> item, (a, b) -> a, LinkedHashMap::new));
        Map<String, List<Double>> subjectScoresByClassAndName = new LinkedHashMap<>();
        for (StudentSummary item : students) {
            item.subjectScores().forEach((subject, score) -> subjectScoresByClassAndName.computeIfAbsent(item.classExamId() + "#" + subject, key -> new ArrayList<>()).add(score));
        }

        return AnalysisCtx.ok(project, classes, classMap, subjects, subjectByClassAndName, scoresBySubjectId, scoresBySubjectName, students, studentsByClass, studentsBySchool, studentByClassAndNo, subjectScoresByClassAndName, new LinkedHashSet<>(subjects.stream().map(ExamSubject::getSubjectName).toList()), benchmarks);
    }

    private List<Map<String, Object>> buildClassStudentRows(AnalysisCtx ctx, List<StudentSummary> classStudents, String schoolId) {
        Map<String, Integer> classRanks = studentRankMap(classStudents);
        Map<String, Integer> schoolRanks = studentRankMap(ctx.studentsBySchool().getOrDefault(schoolId, Collections.emptyList()));
        return classStudents.stream()
                .sorted(Comparator.comparing(StudentSummary::totalScore).reversed())
                .map(item -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentNo", item.studentNo());
                    row.put("studentName", item.studentName());
                    row.put("rank", classRanks.getOrDefault(item.studentNo(), 0));
                    row.put("schoolRank", schoolRanks.getOrDefault(item.studentNo(), 0));
                    row.put("totalScore", round(item.totalScore()));
                    row.put("subjectScores", item.subjectScores().entrySet().stream()
                            .collect(Collectors.toMap(Map.Entry::getKey, e -> round(e.getValue()), (a, b) -> a, LinkedHashMap::new)));
                    return row;
                }).toList();
    }

    private Map<String, Object> buildSubjectSnapshot(AnalysisCtx ctx, ExamClass examClass, StudentSummary student, String subjectName) {
        Double score = student.subjectScores().get(subjectName);
        Double fullScore = student.subjectFullScores().get(subjectName);
        if (score == null || fullScore == null || fullScore <= 0) return null;

        List<Double> classScores = ctx.subjectScoresByClassAndName().getOrDefault(examClass.getId() + "#" + subjectName, Collections.emptyList());
        List<Double> schoolScores = ctx.subjectsBySchoolAndName(examClass.getSchoolId(), subjectName).stream().map(this::scoreValue).toList();
        Map<String, Integer> classRanks = scoreRankMap(ctx.subjectsByClassAndName(examClass.getId(), subjectName));
        Map<String, Integer> schoolRanks = scoreRankMap(ctx.subjectsBySchoolAndName(examClass.getSchoolId(), subjectName));
        double passScore = fullScore * PROJECT_PASS_RATE;

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("subject", subjectName);
        item.put("score", round(score));
        item.put("avgScore", round(average(classScores)));
        item.put("schoolAvg", round(average(schoolScores)));
        item.put("classRank", classRanks.getOrDefault(student.studentNo(), 0));
        item.put("schoolRank", schoolRanks.getOrDefault(student.studentNo(), 0));
        item.put("passScore", round(passScore));
        item.put("classPassRate", round(rateCount(classScores, passScore)));
        item.put("schoolPassRate", round(rateCount(schoolScores, passScore)));
        item.put("analysis", subjectAnalysis(score, average(classScores), average(schoolScores), classRanks.getOrDefault(student.studentNo(), 0)));
        item.put("fullScore", round(fullScore));
        item.put("grade", gradeLabel(score, fullScore));
        item.put("excellentScore", round(fullScore * PROJECT_EXCELLENT_RATE));
        item.put("classExcellentRate", round(rateCount(classScores, fullScore * PROJECT_EXCELLENT_RATE)));
        item.put("schoolExcellentRate", round(rateCount(schoolScores, fullScore * PROJECT_EXCELLENT_RATE)));
        return item;
    }

    private List<Map<String, Object>> buildKnowledgeRates(AnalysisCtx ctx, ExamClass examClass, StudentSummary student, String subjectName) {
        ExamSubject subject = ctx.subjectByClassAndName().get(examClass.getId() + "#" + subjectName);
        if (subject == null) return Collections.emptyList();
        ExamStudentScore score = ctx.scoreBySubjectAndStudent(subject.getId(), student.studentNo());
        if (score == null) return Collections.emptyList();
        List<Double> questionScores = parseQuestionScores(score.getQuestionScores());
        List<ExamStudentScore> classScores = ctx.scoresBySubjectId().getOrDefault(subject.getId(), Collections.emptyList());
        List<ExamStudentScore> schoolScores = ctx.subjectsBySchoolAndName(examClass.getSchoolId(), subjectName);
        List<Double> fullScores = resolveQuestionFullScores(classScores, ctx.benchmarks().get(subjectName));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < Math.min(questionScores.size(), fullScores.size()); i++) {
            final int index = i;
            double full = fullScores.get(i);
            if (full <= 0) continue;
            List<Double> classQuestionScores = classScores.stream()
                    .map(item -> parseQuestionScores(item.getQuestionScores()))
                    .filter(list -> list.size() > index)
                    .map(list -> list.get(index))
                    .toList();
            List<Double> schoolQuestionScores = schoolScores.stream()
                    .map(item -> parseQuestionScores(item.getQuestionScores()))
                    .filter(list -> list.size() > index)
                    .map(list -> list.get(index))
                    .toList();
            double personal = questionScores.get(i);
            double classAvg = average(classQuestionScores);
            double schoolAvg = average(schoolQuestionScores);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", questionLabel(i));
            row.put("rate", round(personal / full * 100D));
            row.put("classRate", round(classAvg / full * 100D));
            row.put("schoolRate", round(schoolAvg / full * 100D));
            row.put("score", round(personal));
            row.put("fullScore", round(full));
            row.put("classAvgScore", round(classAvg));
            row.put("schoolAvgScore", round(schoolAvg));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> buildWrongQuestions(AnalysisCtx ctx, ExamClass examClass, StudentSummary student, String onlySubject) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String subjectName : ctx.subjectNames()) {
            if (StringUtils.hasText(onlySubject) && !onlySubject.equals(subjectName)) continue;
            ExamSubject subject = ctx.subjectByClassAndName().get(examClass.getId() + "#" + subjectName);
            if (subject == null) continue;
            ExamStudentScore score = ctx.scoreBySubjectAndStudent(subject.getId(), student.studentNo());
            if (score == null) continue;

            List<Double> personalScores = parseQuestionScores(score.getQuestionScores());
            List<ExamStudentScore> allScores = ctx.scoresBySubjectId().getOrDefault(subject.getId(), Collections.emptyList());
            List<Double> fullScores = resolveQuestionFullScores(allScores, ctx.benchmarks().get(subjectName));
            for (int i = 0; i < Math.min(personalScores.size(), fullScores.size()); i++) {
                final int index = i;
                double full = fullScores.get(index);
                double personal = personalScores.get(index);
                if (full <= 0 || personal >= full) continue;
                List<Double> rowScores = allScores.stream()
                        .map(item -> parseQuestionScores(item.getQuestionScores()))
                        .filter(list -> list.size() > index)
                        .map(list -> list.get(index))
                        .toList();
                List<Double> schoolRowScores = ctx.subjectsBySchoolAndName(examClass.getSchoolId(), subjectName).stream()
                        .map(item -> parseQuestionScores(item.getQuestionScores()))
                        .filter(list -> list.size() > index)
                        .map(list -> list.get(index))
                        .toList();
                double classAvg = average(rowScores);
                double schoolAvg = average(schoolRowScores);
                double classRate = round(classAvg / full * 100D);
                double schoolRate = round(schoolAvg / full * 100D);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("subject", subjectName);
                row.put("questionNo", String.valueOf(index + 1));
                row.put("type", questionType(index));
                row.put("score", round(personal));
                row.put("fullScore", round(full));
                row.put("avgScore", round(classAvg));
                row.put("schoolAvg", round(schoolAvg));
                row.put("classRate", classRate);
                row.put("schoolRate", schoolRate);
                row.put("knowledgePoint", questionLabel(index));
                row.put("difficulty", (int) difficultyRate(classRate));
                row.put("lostScore", round(full - personal));
                row.put("explanation", buildQuestionExplanation(subjectName, index, personal, full, classAvg, schoolAvg, classRate, schoolRate));
                rows.add(row);
            }
        }
        return rows;
    }

    private MetricSnapshot metricSnapshot(List<StudentSummary> students, double passRate, double excellentRate, double lowRate, double highRate) {
        if (students.isEmpty()) return new MetricSnapshot(0D, 0D, 0D, 0D, 0D);
        List<Double> totals = students.stream().map(StudentSummary::totalScore).toList();
        return new MetricSnapshot(
                average(totals),
                studentRate(students, excellentRate),
                studentRate(students, passRate),
                lowRate > 0 ? studentRateBelow(students, lowRate) : 0D,
                highRate > 0 ? studentRate(students, highRate) : 0D
        );
    }

    private Map<String, Object> rankingRow(String label, List<StudentSummary> rows, double passRate, double excellentRate, double lowRate, double highRate) {
        MetricSnapshot metric = metricSnapshot(rows, passRate, excellentRate, lowRate, highRate);
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", label);
        item.put("className", label);
        item.put("avgScore", round(metric.avgScore()));
        item.put("passRate", round(metric.passRate()));
        item.put("excellentRate", round(metric.excellentRate()));
        item.put("lowRate", round(metric.lowRate()));
        item.put("highRate", round(metric.highRate()));
        return item;
    }

    private Map<String, Object> metricCard(String label, double value, String unit, String color) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("label", label);
        item.put("value", value);
        item.put("unit", unit);
        item.put("trend", 0D);
        item.put("color", color);
        return item;
    }

    private Map<String, Object> rankMetricCard(String title, double value, String unit, int rank, String type) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", title);
        item.put("value", value);
        item.put("unit", unit);
        item.put("rank", rank);
        item.put("trend", 0D);
        item.put("type", type);
        return item;
    }

    private Map<String, Object> thresholdStatusCard(String label, double score, double fullScore, double rate, String status, String passText, String failText) {
        double threshold = fullScore * rate;
        boolean passed = score >= threshold;
        double diff = round(Math.abs(score - threshold));
        String lineName = label.replace("状态", "线");
        String targetText = "优秀状态".equals(label) ? "达到优秀" : "及格";
        String desc = passed
                ? "已超过" + lineName + diff + "分"
                : "还差" + diff + "分" + targetText;
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("label", label);
        card.put("text", passed ? passText : failText);
        card.put("desc", desc);
        card.put("status", passed ? status : "warn");
        return card;
    }

    private Map<String, Object> criticalStatusCard(double score, double fullScore) {
        double passThreshold = fullScore * PROJECT_PASS_RATE;
        double excellentThreshold = fullScore * PROJECT_EXCELLENT_RATE;
        double nearLine = fullScore * 0.1D;
        double passGap = Math.abs(score - passThreshold);
        double excellentGap = Math.abs(score - excellentThreshold);
        boolean closeToPass = passGap <= excellentGap;
        double targetThreshold = closeToPass ? passThreshold : excellentThreshold;
        String targetName = closeToPass ? "及格线" : "优秀线";
        boolean critical = passGap <= nearLine || excellentGap <= nearLine;
        double gap = round(Math.abs(score - targetThreshold));
        String desc = score >= targetThreshold
                ? "已超过" + targetName + gap + "分"
                : "还差" + gap + "分" + (closeToPass ? "及格" : "达到优秀");
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("label", "临界状态");
        card.put("text", critical ? "临界生" : "非临界");
        card.put("desc", desc);
        card.put("status", critical ? "warn" : "safe");
        return card;
    }

    private Map<String, Object> projectBase(ExamProject project) {
        Map<String, Object> base = new LinkedHashMap<>();
        base.put("id", project.getId());
        base.put("name", project.getName());
        base.put("createTime", formatDate(project.getCreateTime()));
        base.put("schoolCount", safeInt(project.getSchoolCount()));
        base.put("classCount", safeInt(project.getClassCount()));
        base.put("studentCount", safeInt(project.getStudentCount()));
        return base;
    }

    private List<Map<String, Object>> buildDistributionRows(List<Double> scores, int segments) {
        if (scores == null || scores.isEmpty()) return Collections.emptyList();
        double maxScore = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0D);
        if (maxScore <= 0) maxScore = 1D;
        double step = Math.ceil(maxScore / segments);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < segments; i++) {
            double start = i == 0 ? 0D : step * i;
            double end = i == segments - 1 ? maxScore : step * (i + 1);
            final int index = i;
            long count = scores.stream()
                    .filter(score -> index == segments - 1 ? score >= start && score <= end : score >= start && score < end)
                    .count();
            long labelStart = i == 0 ? 0L : Math.round(start);
            long labelEnd = i == segments - 1 ? Math.round(maxScore) : Math.round(end) - 1;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("label", labelStart + "-" + labelEnd);
            row.put("count", count);
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Integer> rankMap(List<Map<String, Object>> rows, String key, java.util.function.Function<Map<String, Object>, Double> scoreFn) {
        List<Map<String, Object>> sorted = rows.stream().sorted(Comparator.comparing(scoreFn).reversed()).toList();
        Map<String, Integer> ranks = new HashMap<>();
        for (int i = 0; i < sorted.size(); i++) ranks.put(String.valueOf(sorted.get(i).get(key)), i + 1);
        return ranks;
    }

    private Map<String, Integer> studentRankMap(List<StudentSummary> students) {
        List<StudentSummary> sorted = students.stream().sorted(Comparator.comparing(StudentSummary::totalScore).reversed()).toList();
        Map<String, Integer> ranks = new HashMap<>();
        for (int i = 0; i < sorted.size(); i++) ranks.put(sorted.get(i).studentNo(), i + 1);
        return ranks;
    }

    private Map<String, Integer> scoreRankMap(List<ExamStudentScore> scores) {
        List<ExamStudentScore> sorted = scores.stream().sorted(Comparator.comparing(this::scoreValue).reversed()).toList();
        Map<String, Integer> ranks = new HashMap<>();
        for (int i = 0; i < sorted.size(); i++) ranks.put(sorted.get(i).getStudentNo(), i + 1);
        return ranks;
    }

    private double studentRate(List<StudentSummary> students, double thresholdRate) {
        long count = students.stream().filter(item -> item.totalFullScore() > 0 && item.totalScore() >= item.totalFullScore() * thresholdRate).count();
        return students.isEmpty() ? 0D : count * 100D / students.size();
    }

    private double studentRateBelow(List<StudentSummary> students, double thresholdRate) {
        long count = students.stream().filter(item -> item.totalFullScore() > 0 && item.totalScore() < item.totalFullScore() * thresholdRate).count();
        return students.isEmpty() ? 0D : count * 100D / students.size();
    }

    private double average(List<Double> values) {
        return values == null || values.isEmpty() ? 0D : values.stream().mapToDouble(Double::doubleValue).average().orElse(0D);
    }

    private double rateCount(List<Double> values, double threshold) {
        if (values == null || values.isEmpty()) return 0D;
        return values.stream().filter(value -> value >= threshold).count() * 100D / values.size();
    }

    private String subjectAnalysis(double score, double classAvg, double schoolAvg, int classRank) {
        if (score >= classAvg + 10) return "学科表现突出，显著高于班级均值";
        if (score >= schoolAvg) return "学科表现稳定，整体高于校级均值";
        if (classRank > 0 && classRank <= 3) return "学科排名靠前，建议继续保持";
        return "该学科仍有提升空间，建议针对薄弱点进行巩固";
    }

    private String gradeLabel(double score, double fullScore) {
        if (fullScore <= 0) return "C";
        double ratio = score / fullScore;
        if (ratio >= 0.9) return "A";
        if (ratio >= 0.8) return "B";
        if (ratio >= 0.6) return "C";
        return "D";
    }

    private String questionType(int index) {
        if (index < 10) return "选择题";
        if (index < 15) return "填空题";
        return "解答题";
    }

    private String questionLabel(int index) {
        return "第" + (index + 1) + "题";
    }

    private String buildQuestionExplanation(String subjectName, int index, double personal, double full, double classAvg, double schoolAvg, double classRate, double schoolRate) {
        double lostScore = Math.max(0D, full - personal);
        double classGap = round(personal - classAvg);
        double schoolGap = round(personal - schoolAvg);
        String classCompare = classGap >= 0
                ? "高于班均" + round(classGap) + "分"
                : "低于班均" + round(Math.abs(classGap)) + "分";
        String schoolCompare = schoolGap >= 0
                ? "高于校均" + round(schoolGap) + "分"
                : "低于校均" + round(Math.abs(schoolGap)) + "分";
        String difficultyDesc = classRate < 60
                ? "班级整体失分较多，属于当前试卷的高难度题。"
                : schoolRate < 75
                ? "校级平均得分率不高，建议重点复盘该题型。"
                : "这道题更偏向细节失分，建议核对步骤与计算过程。";
        return subjectName + questionLabel(index) + "失分" + round(lostScore) + "分，" + classCompare + "，" + schoolCompare + "。" + difficultyDesc;
    }

    private double difficultyRate(double scoreRate) {
        if (scoreRate < 60) return 3;
        if (scoreRate < 80) return 2;
        return 1;
    }

    private List<Double> resolveQuestionFullScores(List<ExamStudentScore> scores, SubjectBenchmark benchmark) {
        if (benchmark != null && benchmark.questionScores() != null && !benchmark.questionScores().isEmpty()) return benchmark.questionScores();
        List<List<Double>> all = scores.stream().map(item -> parseQuestionScores(item.getQuestionScores())).filter(list -> !list.isEmpty()).toList();
        int maxSize = all.stream().mapToInt(List::size).max().orElse(0);
        List<Double> inferred = new ArrayList<>();
        for (int i = 0; i < maxSize; i++) {
            final int index = i;
            inferred.add(all.stream().filter(list -> list.size() > index).mapToDouble(list -> list.get(index)).max().orElse(0D));
        }
        return inferred;
    }

    private Map<String, SubjectBenchmark> parseBenchmarks(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try {
            Map<String, Map<String, Object>> raw = objectMapper.readValue(json, new TypeReference<>() {});
            Map<String, SubjectBenchmark> result = new LinkedHashMap<>();
            for (Map.Entry<String, Map<String, Object>> entry : raw.entrySet()) {
                double total = asDouble(entry.getValue().get("totalScore"));
                List<Double> questions = new ArrayList<>();
                Object questionList = entry.getValue().get("questions");
                if (questionList instanceof Collection<?> collection) {
                    for (Object item : collection) {
                        if (item instanceof Map<?, ?> map) questions.add(asDouble(map.get("score")));
                    }
                }
                result.put(entry.getKey(), new SubjectBenchmark(total, questions));
            }
            return result;
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private List<Double> parseQuestionScores(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Double>>() {});
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private double subjectFullScore(Map<String, SubjectBenchmark> benchmarks, String subjectName, List<ExamStudentScore> scores, ExamStudentScore selfScore) {
        SubjectBenchmark benchmark = benchmarks.get(subjectName);
        if (benchmark != null && benchmark.totalScore() > 0) return benchmark.totalScore();
        double fallback = scores.stream().mapToDouble(this::scoreValue).max().orElse(0D);
        if (fallback > 0) return fallback;
        return selfScore != null && scoreValue(selfScore) > 0 ? scoreValue(selfScore) : 100D;
    }

    private double subjectFullScore(AnalysisCtx ctx, String subjectName, List<ExamStudentScore> scores) {
        return subjectFullScore(ctx.benchmarks(), subjectName, scores, null);
    }

    private boolean isEnteredScore(ExamStudentScore score) {
        return score != null && Boolean.TRUE.equals(score.getScoreEntered()) && score.getTotalScore() != null;
    }

    private double scoreValue(ExamStudentScore score) {
        return score == null || score.getTotalScore() == null ? 0D : score.getTotalScore();
    }

    private boolean containsIgnoreCase(String source, String keyword) {
        return StringUtils.hasText(source) && StringUtils.hasText(keyword)
                && source.toLowerCase(Locale.ROOT).contains(keyword.trim().toLowerCase(Locale.ROOT));
    }

    private String formatDate(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_FORMATTER);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private double asDouble(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        if (value == null) return 0D;
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0D;
        }
    }

    private double round(double value) {
        return Math.round(value * 10D) / 10D;
    }

    private record SubjectBenchmark(double totalScore, List<Double> questionScores) {}

    private record StudentSummary(
            String studentNo,
            String studentName,
            String schoolId,
            String schoolName,
            String classExamId,
            String classDisplay,
            Map<String, Double> subjectScores,
            Map<String, Double> subjectFullScores
    ) {
        private double totalScore() {
            return subjectScores.values().stream().mapToDouble(Double::doubleValue).sum();
        }

        private double totalFullScore() {
            return subjectFullScores.values().stream().mapToDouble(Double::doubleValue).sum();
        }
    }

    private record MetricSnapshot(double avgScore, double excellentRate, double passRate, double lowRate, double highRate) {}

    private record AnalysisCtx(
            boolean ok,
            String msg,
            ExamProject project,
            List<ExamClass> classes,
            Map<String, ExamClass> classMap,
            List<ExamSubject> subjects,
            Map<String, ExamSubject> subjectByClassAndName,
            Map<String, List<ExamStudentScore>> scoresBySubjectId,
            Map<String, List<ExamStudentScore>> scoresBySubjectName,
            List<StudentSummary> students,
            Map<String, List<StudentSummary>> studentsByClass,
            Map<String, List<StudentSummary>> studentsBySchool,
            Map<String, StudentSummary> studentByClassAndNo,
            Map<String, List<Double>> subjectScoresByClassAndName,
            Set<String> subjectNames,
            Map<String, SubjectBenchmark> benchmarks
    ) {
        private static AnalysisCtx ok(
                ExamProject project,
                List<ExamClass> classes,
                Map<String, ExamClass> classMap,
                List<ExamSubject> subjects,
                Map<String, ExamSubject> subjectByClassAndName,
                Map<String, List<ExamStudentScore>> scoresBySubjectId,
                Map<String, List<ExamStudentScore>> scoresBySubjectName,
                List<StudentSummary> students,
                Map<String, List<StudentSummary>> studentsByClass,
                Map<String, List<StudentSummary>> studentsBySchool,
                Map<String, StudentSummary> studentByClassAndNo,
                Map<String, List<Double>> subjectScoresByClassAndName,
                Set<String> subjectNames,
                Map<String, SubjectBenchmark> benchmarks) {
            return new AnalysisCtx(true, "", project, classes, classMap, subjects, subjectByClassAndName, scoresBySubjectId, scoresBySubjectName, students, studentsByClass, studentsBySchool, studentByClassAndNo, subjectScoresByClassAndName, subjectNames, benchmarks);
        }

        private static AnalysisCtx fail(String msg) {
            return new AnalysisCtx(false, msg, null, Collections.emptyList(), Collections.emptyMap(), Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptySet(), Collections.emptyMap());
        }

        private ExamStudentScore scoreBySubjectAndStudent(String subjectId, String studentNo) {
            return scoresBySubjectId.getOrDefault(subjectId, Collections.emptyList()).stream()
                    .filter(item -> studentNo.equals(item.getStudentNo()))
                    .findFirst()
                    .orElse(null);
        }

        private List<ExamStudentScore> subjectsByClassAndName(String classId, String subjectName) {
            ExamSubject subject = subjectByClassAndName.get(classId + "#" + subjectName);
            return subject == null ? Collections.emptyList() : scoresBySubjectId.getOrDefault(subject.getId(), Collections.emptyList());
        }

        private List<ExamStudentScore> subjectsBySchoolAndName(String schoolId, String subjectName) {
            return subjects.stream()
                    .filter(item -> subjectName.equals(item.getSubjectName()))
                    .filter(item -> {
                        ExamClass examClass = classMap.get(item.getClassId());
                        return examClass != null && schoolId.equals(examClass.getSchoolId());
                    })
                    .flatMap(item -> scoresBySubjectId.getOrDefault(item.getId(), Collections.emptyList()).stream())
                    .toList();
        }
    }
}
