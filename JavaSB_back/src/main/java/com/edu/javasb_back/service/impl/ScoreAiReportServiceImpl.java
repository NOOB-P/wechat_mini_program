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
import com.edu.javasb_back.service.ScoreAiReportService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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

        List<String> classIds = projectClasses.stream().map(ExamClass::getId).toList();
        List<ExamSubject> projectSubjects = examSubjectRepository.findByClassIdInOrderBySubjectNameAsc(classIds);
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
                .filter(item -> currentClass.getId().equals(item.getClassId()))
                .collect(Collectors.toMap(ExamSubject::getSubjectName, item -> item, (a, b) -> a, LinkedHashMap::new));

        Map<String, Double> fullScoreMap = parseBenchmarks(project.getSubjectBenchmarks());
        Map<String, List<Map<String, Object>>> paperLayoutMap = parsePaperLayouts(project.getPaperLayouts(), currentSubjectMap.keySet());
        List<StudentTotalRow> totals = buildStudentTotals(enteredScores, subjectMap, classMap);
        if (totals.isEmpty()) {
            return ProjectContext.fail("考试项目下暂无已录入成绩");
        }

        return ProjectContext.success(project, student, currentClass, classMap, currentSubjectMap, subjectMap, enteredScores, fullScoreMap, paperLayoutMap, totals);
    }

    private List<StudentTotalRow> buildStudentTotals(List<ExamStudentScore> scores, Map<String, ExamSubject> subjectMap, Map<String, ExamClass> classMap) {
        Map<String, StudentTotalAccumulator> accumulatorMap = new LinkedHashMap<>();
        for (ExamStudentScore score : scores) {
            ExamSubject subject = subjectMap.get(score.getSubjectId());
            if (subject == null) continue;
            ExamClass examClass = classMap.get(subject.getClassId());
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
        List<String> classIds = context.classMap().values().stream()
                .filter(item -> predicate.test(new StudentTotalRow("", "", item.getId(), item.getSchoolId(), item.getGrade(), 0D)))
                .map(ExamClass::getId)
                .toList();
        List<String> subjectIds = context.subjectMap().values().stream()
                .filter(item -> subjectName.equals(item.getSubjectName()) && classIds.contains(item.getClassId()))
                .map(ExamSubject::getId)
                .toList();
        if (subjectIds.isEmpty()) return Collections.emptyList();
        return context.enteredScores().stream().filter(item -> subjectIds.contains(item.getSubjectId())).toList();
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
            raw.forEach((key, value) -> result.put(key, asDouble(value)));
            return result;
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private Map<String, List<Map<String, Object>>> parsePaperLayouts(String json, Collection<String> currentSubjects) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try {
            Map<String, Object> raw = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
            for (String subjectName : currentSubjects) {
                Map<String, Object> subjectLayout = map(raw.get(subjectName));
                List<Map<String, Object>> rows = listMap(subjectLayout.get("template"));
                if (rows.isEmpty()) {
                    rows = listMap(subjectLayout.get("original"));
                }
                result.put(subjectName, rows);
            }
            return result;
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private Map<String, Object> map(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            Map<String, Object> result = new LinkedHashMap<>();
            rawMap.forEach((key, val) -> result.put(String.valueOf(key), val));
            return result;
        }
        return Collections.emptyMap();
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
