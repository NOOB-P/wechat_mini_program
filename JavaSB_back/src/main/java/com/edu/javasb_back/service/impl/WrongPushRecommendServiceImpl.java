package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamQuestionXkwMapping;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamQuestionXkwMappingRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.ScoreService;
import com.edu.javasb_back.service.WrongPushRecommendService;
import com.edu.javasb_back.service.support.XkwQuestionClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class WrongPushRecommendServiceImpl implements WrongPushRecommendService {
    private static final String QUESTION_MAPPING_CACHE_PREFIX = "xkw:wrong-push:question-match:";
    private static final String RECOMMENDATION_CACHE_PREFIX = "xkw:wrong-push:recommend:";
    private static final String CACHE_MISS = "__MISS__";
    private static final long QUESTION_MAPPING_CACHE_DAYS = 30L;
    private static final long RECOMMENDATION_CACHE_DAYS = 7L;
    private static final long MISS_CACHE_HOURS = 6L;

    @Autowired
    private ScoreService scoreService;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysStudentRepository studentRepository;

    @Autowired
    private ExamQuestionXkwMappingRepository examQuestionXkwMappingRepository;

    @Autowired
    private XkwQuestionClient xkwQuestionClient;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public Result<Map<String, Object>> recommendWrongQuestion(Long uid, String examId, String subject, String questionNo, Integer count) {
        if (uid == null) {
            return Result.error("请先登录");
        }
        if (!StringUtils.hasText(examId)) {
            return Result.error("考试ID不能为空");
        }
        if (!StringUtils.hasText(subject)) {
            return Result.error("学科不能为空");
        }
        if (!StringUtils.hasText(questionNo)) {
            return Result.error("题号不能为空");
        }
        if (!xkwQuestionClient.isConfigured()) {
            return Result.error("学科网配置未完成，请联系管理员");
        }

        Optional<SysStudent> studentOpt = getBoundStudent(uid);
        if (studentOpt.isEmpty()) {
            return Result.error("未绑定学生账号");
        }

        Result<Map<String, Object>> scoreResult = scoreService.getStudentScores(uid, null, examId);
        if (scoreResult.getCode() != 200 || scoreResult.getData() == null) {
            return Result.error(scoreResult.getMsg() == null ? "获取错题数据失败" : scoreResult.getMsg());
        }

        String normalizedSubject = subject.trim();
        String normalizedQuestionNo = normalizeQuestionNo(questionNo);
        Map<String, Object> wrongQuestion = resolveWrongQuestion(scoreResult.getData(), normalizedSubject, normalizedQuestionNo);
        if (wrongQuestion == null) {
            return Result.error("未找到对应错题");
        }

        try {
            SysStudent student = studentOpt.get();
            QuestionMappingPayload mapping = loadOrMatchQuestionMapping(
                    examId.trim(),
                    normalizedSubject,
                    normalizedQuestionNo,
                    stringValue(wrongQuestion.get("question")),
                    stringValue(wrongQuestion.get("sliceImageUrl")),
                    student.getGrade()
            );
            if (mapping == null || !StringUtils.hasText(mapping.xkwQuestionId())) {
                return Result.error("未匹配到学科网原题");
            }

            List<Map<String, Object>> recommendations = loadOrRecommend(mapping.xkwQuestionId(), count);

            Map<String, Object> data = new LinkedHashMap<>();
            Map<String, Object> sourceQuestion = new LinkedHashMap<>();
            sourceQuestion.put("subject", normalizedSubject);
            sourceQuestion.put("questionNo", normalizedQuestionNo);
            sourceQuestion.put("questionText", stringValue(wrongQuestion.get("question")));
            sourceQuestion.put("matchedQuestionId", mapping.xkwQuestionId());
            sourceQuestion.put("matchedBy", mapping.matchedBy());
            sourceQuestion.put("courseId", mapping.courseId());
            data.put("sourceQuestion", sourceQuestion);
            data.put("recommendations", normalizeRecommendations(recommendations));
            return Result.success("获取成功", data);
        } catch (Exception e) {
            return Result.error("学科网举一反三获取失败: " + e.getMessage());
        }
    }

    private Optional<SysStudent> getBoundStudent(Long uid) {
        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) {
            return Optional.empty();
        }
        return studentRepository.findById(bindings.get(0).getStudentId());
    }

    private Map<String, Object> resolveWrongQuestion(Map<String, Object> scoreData, String subject, String questionNo) {
        List<Map<String, Object>> wrongQuestions = listMap(scoreData.get("wrongQuestions"));
        return wrongQuestions.stream()
                .filter(item -> equalsText(stringValue(item.get("subject")), subject))
                .filter(item -> normalizeQuestionNo(stringValue(item.get("questionNo"))).equals(questionNo))
                .findFirst()
                .orElse(null);
    }

    private QuestionMappingPayload loadOrMatchQuestionMapping(
            String examId,
            String subject,
            String questionNo,
            String questionText,
            String imageUrl,
            String grade) {
        String cacheKey = buildQuestionMappingCacheKey(examId, subject, questionNo);
        String cached = getRedisValue(cacheKey);
        if (CACHE_MISS.equals(cached)) {
            return null;
        }
        if (StringUtils.hasText(cached)) {
            QuestionMappingPayload payload = readQuestionMappingPayload(cached);
            if (payload != null && StringUtils.hasText(payload.xkwQuestionId())) {
                return payload;
            }
        }

        Optional<ExamQuestionXkwMapping> mappingOpt =
                examQuestionXkwMappingRepository.findByExamIdAndSubjectAndQuestionNo(examId, subject, questionNo);
        if (mappingOpt.isPresent() && StringUtils.hasText(mappingOpt.get().getXkwQuestionId())) {
            QuestionMappingPayload payload = new QuestionMappingPayload(
                    mappingOpt.get().getCourseId(),
                    mappingOpt.get().getXkwQuestionId(),
                    stringValue(mappingOpt.get().getMatchedBy())
            );
            cacheQuestionMapping(cacheKey, payload);
            return payload;
        }

        Integer courseId = xkwQuestionClient.resolveCourseId(grade, subject);
        if (courseId == null || courseId <= 0) {
            return null;
        }

        Map<String, Object> matchedQuestion = xkwQuestionClient.searchBestQuestion(courseId, questionText, imageUrl);
        if (matchedQuestion == null || !StringUtils.hasText(stringValue(matchedQuestion.get("id")))) {
            cacheMiss(cacheKey);
            return null;
        }

        QuestionMappingPayload payload = new QuestionMappingPayload(
                courseId,
                stringValue(matchedQuestion.get("id")),
                stringValue(matchedQuestion.get("_matchedBy"))
        );
        saveQuestionMapping(examId, subject, questionNo, questionText, payload);
        cacheQuestionMapping(cacheKey, payload);
        return payload;
    }

    private void saveQuestionMapping(
            String examId,
            String subject,
            String questionNo,
            String questionText,
            QuestionMappingPayload payload) {
        ExamQuestionXkwMapping entity = examQuestionXkwMappingRepository
                .findByExamIdAndSubjectAndQuestionNo(examId, subject, questionNo)
                .orElseGet(ExamQuestionXkwMapping::new);
        entity.setExamId(examId);
        entity.setSubject(subject);
        entity.setQuestionNo(questionNo);
        entity.setQuestionText(questionText);
        entity.setCourseId(payload.courseId());
        entity.setXkwQuestionId(payload.xkwQuestionId());
        entity.setMatchedBy(payload.matchedBy());
        examQuestionXkwMappingRepository.save(entity);
    }

    private List<Map<String, Object>> loadOrRecommend(String xkwQuestionId, Integer count) {
        int finalCount = clampCount(count, 5);
        String cacheKey = buildRecommendationCacheKey(xkwQuestionId, finalCount);
        String cached = getRedisValue(cacheKey);
        if (StringUtils.hasText(cached)) {
            List<Map<String, Object>> payload = readRecommendationPayload(cached);
            if (payload != null) {
                return payload;
            }
        }

        List<Map<String, Object>> recommendations = xkwQuestionClient.similarRecommend(xkwQuestionId, finalCount);
        cacheRecommendations(cacheKey, recommendations);
        return recommendations;
    }

    private List<Map<String, Object>> normalizeRecommendations(List<Map<String, Object>> rawList) {
        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> item : rawList) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("questionId", stringValue(item.get("id")));
            row.put("stem", stringValue(item.get("stem")));
            row.put("answer", stringValue(item.get("answer")));
            row.put("explanation", stringValue(item.get("explanation")));
            row.put("difficulty", item.get("difficulty"));
            row.put("similarity", item.get("similarity"));
            row.put("courseId", item.get("course_id"));
            row.put("courseName", nestedName(item.get("course")));
            row.put("typeId", nestedId(item.get("type")));
            row.put("typeName", nestedName(item.get("type")));
            row.put("kpoints", normalizeIdNameList(item.get("kpoints")));
            row.put("tags", normalizeIdNameList(item.get("tags")));
            result.add(row);
        }
        return result;
    }

    private List<Map<String, Object>> normalizeIdNameList(Object value) {
        if (!(value instanceof List<?> list)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> raw) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", raw.get("id"));
                row.put("name", stringValue(raw.get("name")));
                result.add(row);
            }
        }
        return result;
    }

    private String nestedName(Object value) {
        if (value instanceof Map<?, ?> map) {
            Object name = map.get("name");
            return name == null ? "" : String.valueOf(name);
        }
        return "";
    }

    private Object nestedId(Object value) {
        if (value instanceof Map<?, ?> map) {
            return map.get("id");
        }
        return null;
    }

    private List<Map<String, Object>> listMap(Object value) {
        if (!(value instanceof List<?> list)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> raw) {
                Map<String, Object> row = new LinkedHashMap<>();
                raw.forEach((key, itemValue) -> row.put(String.valueOf(key), itemValue));
                result.add(row);
            }
        }
        return result;
    }

    private void cacheQuestionMapping(String cacheKey, QuestionMappingPayload payload) {
        try {
            stringRedisTemplate.opsForValue().set(
                    cacheKey,
                    objectMapper.writeValueAsString(payload),
                    QUESTION_MAPPING_CACHE_DAYS,
                    TimeUnit.DAYS
            );
        } catch (Exception ignored) {
        }
    }

    private void cacheRecommendations(String cacheKey, List<Map<String, Object>> recommendations) {
        try {
            stringRedisTemplate.opsForValue().set(
                    cacheKey,
                    objectMapper.writeValueAsString(recommendations == null ? Collections.emptyList() : recommendations),
                    RECOMMENDATION_CACHE_DAYS,
                    TimeUnit.DAYS
            );
        } catch (Exception ignored) {
        }
    }

    private void cacheMiss(String cacheKey) {
        try {
            stringRedisTemplate.opsForValue().set(cacheKey, CACHE_MISS, MISS_CACHE_HOURS, TimeUnit.HOURS);
        } catch (Exception ignored) {
        }
    }

    private String getRedisValue(String cacheKey) {
        try {
            return stringRedisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            return null;
        }
    }

    private QuestionMappingPayload readQuestionMappingPayload(String json) {
        try {
            return objectMapper.readValue(json, QuestionMappingPayload.class);
        } catch (Exception e) {
            return null;
        }
    }

    private List<Map<String, Object>> readRecommendationPayload(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    private String buildQuestionMappingCacheKey(String examId, String subject, String questionNo) {
        return QUESTION_MAPPING_CACHE_PREFIX + examId + ":" + subject + ":" + questionNo;
    }

    private String buildRecommendationCacheKey(String xkwQuestionId, int count) {
        return RECOMMENDATION_CACHE_PREFIX + xkwQuestionId + ":" + count;
    }

    private boolean equalsText(String left, String right) {
        return stringValue(left).trim().equals(stringValue(right).trim());
    }

    private String normalizeQuestionNo(String questionNo) {
        String digits = stringValue(questionNo).replaceAll("[^0-9]", "");
        return StringUtils.hasText(digits) ? digits : stringValue(questionNo).trim();
    }

    private int clampCount(Integer value, int defaultValue) {
        int resolved = value == null ? defaultValue : value;
        if (resolved <= 0) {
            return defaultValue;
        }
        return Math.min(resolved, 10);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static class QuestionMappingPayload {
        private Integer courseId;
        private String xkwQuestionId;
        private String matchedBy;

        public QuestionMappingPayload() {
        }

        public QuestionMappingPayload(Integer courseId, String xkwQuestionId, String matchedBy) {
            this.courseId = courseId;
            this.xkwQuestionId = xkwQuestionId;
            this.matchedBy = matchedBy;
        }

        public Integer courseId() {
            return courseId;
        }

        public String xkwQuestionId() {
            return xkwQuestionId;
        }

        public String matchedBy() {
            return matchedBy;
        }

        public Integer getCourseId() {
            return courseId;
        }

        public void setCourseId(Integer courseId) {
            this.courseId = courseId;
        }

        public String getXkwQuestionId() {
            return xkwQuestionId;
        }

        public void setXkwQuestionId(String xkwQuestionId) {
            this.xkwQuestionId = xkwQuestionId;
        }

        public String getMatchedBy() {
            return matchedBy;
        }

        public void setMatchedBy(String matchedBy) {
            this.matchedBy = matchedBy;
        }
    }
}
