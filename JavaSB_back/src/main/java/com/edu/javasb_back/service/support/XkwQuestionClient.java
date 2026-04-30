package com.edu.javasb_back.service.support;

import com.edu.javasb_back.config.GlobalConfigProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xkw.xop.client.XopHttpClient;
import kong.unirest.HttpResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class XkwQuestionClient {
    private static final long COURSE_CACHE_TTL_MILLIS = Duration.ofHours(6).toMillis();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private ObjectMapper objectMapper;

    private volatile XopHttpClient xopHttpClient;
    private volatile List<Map<String, Object>> courseCache = Collections.emptyList();
    private volatile long courseCacheAt = 0L;

    public boolean isConfigured() {
        return StringUtils.hasText(globalConfigProperties.getXkwAppId())
                && StringUtils.hasText(globalConfigProperties.getXkwAppSecret());
    }

    public Integer resolveCourseId(String grade, String subject) {
        List<Map<String, Object>> courses = getCourseList();
        if (courses.isEmpty()) {
            return null;
        }

        String stageLabel = resolveStageLabel(grade);
        List<String> aliases = resolveSubjectAliases(subject);
        if (aliases.isEmpty()) {
            return null;
        }

        List<Map<String, Object>> candidates = courses.stream()
                .filter(item -> matchesSubject(item, aliases))
                .toList();
        if (candidates.isEmpty()) {
            return null;
        }

        if (StringUtils.hasText(stageLabel)) {
            List<Map<String, Object>> stageCandidates = candidates.stream()
                    .filter(item -> containsText(stringValue(item.get("name")), stageLabel))
                    .toList();
            if (!stageCandidates.isEmpty()) {
                candidates = stageCandidates;
            }
        }

        return candidates.stream()
                .sorted(Comparator
                        .comparingInt((Map<String, Object> item) -> scoreCourseName(item, stageLabel, aliases))
                        .thenComparingInt(item -> asInt(item.get("ordinal"), Integer.MAX_VALUE))
                        .thenComparingInt(item -> asInt(item.get("id"), Integer.MAX_VALUE)))
                .map(item -> asInt(item.get("id"), 0))
                .filter(id -> id > 0)
                .findFirst()
                .orElse(null);
    }

    public Map<String, Object> searchBestQuestion(Integer courseId, String questionText, String imageUrl) {
        if (courseId == null || courseId <= 0) {
            return null;
        }

        String cleanedText = sanitizeQuestionText(questionText);
        if (isUsableQuestionText(cleanedText)) {
            Map<String, Object> matched = searchByText(courseId, cleanedText);
            if (matched != null) {
                matched.put("_matchedBy", "text");
                return matched;
            }
        }

        if (StringUtils.hasText(imageUrl)) {
            Map<String, Object> matched = searchByImage(courseId, imageUrl);
            if (matched != null) {
                matched.put("_matchedBy", "image");
                return matched;
            }
        }
        return null;
    }

    public List<Map<String, Object>> similarRecommend(String questionId, Integer count) {
        if (!StringUtils.hasText(questionId)) {
            return Collections.emptyList();
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("formula_pic_format", "png");
        body.put("count", clampCount(count, 5));
        body.put("question_id", questionId.trim());

        HttpResponse<String> response = getClient().post("/xopqbm/questions/v2/similar-recommend", Collections.emptyMap(), body);
        return parseXkwArrayResponse(response.getBody());
    }

    private Map<String, Object> searchByText(Integer courseId, String questionText) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("course_id", courseId);
        body.put("formula_pic_format", "png");
        body.put("count", 1);
        body.put("text", questionText);

        HttpResponse<String> response = getClient().post("/xopqbm/questions/text-search", Collections.emptyMap(), body);
        List<Map<String, Object>> result = parseQuestionSearchResponse(response.getBody());
        return result.isEmpty() ? null : result.get(0);
    }

    private Map<String, Object> searchByImage(Integer courseId, String imageUrl) {
        String imageBase64 = downloadImageAsBase64(imageUrl);
        if (!StringUtils.hasText(imageBase64)) {
            return null;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("course_id", courseId);
        body.put("formula_pic_format", "png");
        body.put("count", 1);
        body.put("image_base64", imageBase64);

        HttpResponse<String> response = getClient().post("/xopqbm/questions/text-search", Collections.emptyMap(), body);
        List<Map<String, Object>> result = parseQuestionSearchResponse(response.getBody());
        return result.isEmpty() ? null : result.get(0);
    }

    private List<Map<String, Object>> getCourseList() {
        long now = System.currentTimeMillis();
        List<Map<String, Object>> cache = courseCache;
        if (!cache.isEmpty() && now - courseCacheAt < COURSE_CACHE_TTL_MILLIS) {
            return cache;
        }

        synchronized (this) {
            if (!courseCache.isEmpty() && now - courseCacheAt < COURSE_CACHE_TTL_MILLIS) {
                return courseCache;
            }
            HttpResponse<String> response = getClient().get("/xopqbm/courses/all", Collections.emptyMap());
            List<Map<String, Object>> courses = parseXkwArrayResponse(response.getBody());
            courseCache = courses;
            courseCacheAt = System.currentTimeMillis();
            return courses;
        }
    }

    private XopHttpClient getClient() {
        if (!isConfigured()) {
            throw new IllegalStateException("学科网 AppId/AppSecret 未配置");
        }
        if (xopHttpClient != null) {
            return xopHttpClient;
        }
        synchronized (this) {
            if (xopHttpClient != null) {
                return xopHttpClient;
            }
            XopHttpClient.Builder builder = new XopHttpClient.Builder()
                    .appId(globalConfigProperties.getXkwAppId().trim())
                    .secret(globalConfigProperties.getXkwAppSecret().trim())
                    .timeout(asInt(globalConfigProperties.getXkwTimeoutSeconds(), 15));
            if (StringUtils.hasText(globalConfigProperties.getXkwGatewayHost())) {
                builder.gatewayHost(globalConfigProperties.getXkwGatewayHost().trim());
            }
            xopHttpClient = builder.build();
            return xopHttpClient;
        }
    }

    private List<Map<String, Object>> parseQuestionSearchResponse(String body) {
        System.out.println(">>> 学科网搜题原始返回: " + body);
        Map<String, Object> root = readJsonMap(body);
        Integer code = asNullableInt(root.get("code"));
        if (code != null && code != 2000000 && code != 900161214 && code != 200) {
            throw new IllegalStateException(resolveErrorMessage(root, "学科网搜题失败"));
        }
        return listMap(root.get("data"));
    }

    private List<Map<String, Object>> parseXkwArrayResponse(String body) {
        System.out.println(">>> 学科网 API 原始返回: " + body);
        String trimmed = body == null ? "" : body.trim();
        if (!StringUtils.hasText(trimmed)) {
            return Collections.emptyList();
        }
        if (trimmed.startsWith("[")) {
            return parseArrayResponse(trimmed);
        }
        Map<String, Object> root = readJsonMap(trimmed);
        Integer code = asNullableInt(root.get("code"));
        if (code != null && code != 2000000 && code != 900161214 && code != 200) {
            throw new IllegalStateException(resolveErrorMessage(root, "学科网请求失败"));
        }
        Object data = root.get("data");
        if (data instanceof List<?>) {
            return listMap(data);
        }
        return Collections.emptyList();
    }

    private List<Map<String, Object>> parseArrayResponse(String body) {
        try {
            System.out.println(">>> 学科网数组解析原始返回: " + body);
            return objectMapper.readValue(body, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("解析学科网返回数据失败: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> readJsonMap(String body) {
        try {
            System.out.println(">>> 学科网对象解析原始返回: " + body);
            return objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("解析学科网返回数据失败: " + e.getMessage(), e);
        }
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

    private String downloadImageAsBase64(String imageUrl) {
        try {
            java.net.http.HttpResponse<byte[]> response = HTTP_CLIENT.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create(imageUrl))
                            .timeout(Duration.ofSeconds(20))
                            .GET()
                            .build(),
                    BodyHandlers.ofByteArray()
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300 || response.body() == null || response.body().length == 0) {
                return "";
            }
            return Base64.getEncoder().encodeToString(response.body());
        } catch (Exception e) {
            return "";
        }
    }

    private String sanitizeQuestionText(String questionText) {
        if (!StringUtils.hasText(questionText)) {
            return "";
        }
        String text = questionText
                .replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (text.length() > 2000) {
            return text.substring(0, 2000);
        }
        return text;
    }

    private boolean isUsableQuestionText(String text) {
        if (!StringUtils.hasText(text)) {
            return false;
        }
        if (text.length() < 8) {
            return false;
        }
        return !text.matches("^第?\\d+题?$");
    }

    private boolean matchesSubject(Map<String, Object> course, List<String> aliases) {
        String name = stringValue(course.get("name"));
        return aliases.stream().anyMatch(alias -> containsText(name, alias));
    }

    private int scoreCourseName(Map<String, Object> course, String stageLabel, List<String> aliases) {
        String normalizedName = normalizeForMatch(stringValue(course.get("name")));
        int score = 0;
        if (StringUtils.hasText(stageLabel) && normalizedName.contains(normalizeForMatch(stageLabel))) {
            score -= 100;
        }
        for (String alias : aliases) {
            String normalizedAlias = normalizeForMatch(alias);
            if (normalizedName.equals(normalizeForMatch(stageLabel + alias))) {
                score -= 200;
            } else if (normalizedName.contains(normalizedAlias)) {
                score -= 50;
            }
        }
        score += normalizedName.length();
        return score;
    }

    private List<String> resolveSubjectAliases(String subject) {
        String normalized = stringValue(subject).trim();
        if (!StringUtils.hasText(normalized)) {
            return Collections.emptyList();
        }
        return switch (normalized) {
            case "政治" -> List.of("思想政治", "政治", "道德与法治");
            case "生物" -> List.of("生物学", "生物");
            case "语文", "数学", "英语", "物理", "化学", "历史", "地理" -> List.of(normalized);
            default -> List.of(normalized);
        };
    }

    private String resolveStageLabel(String grade) {
        String value = stringValue(grade);
        if (!StringUtils.hasText(value)) {
            return "";
        }
        if (value.contains("高")) {
            return "高中";
        }
        if (value.contains("初") || value.contains("七年级") || value.contains("八年级") || value.contains("九年级")) {
            return "初中";
        }
        if (value.contains("小学")
                || value.contains("一年级")
                || value.contains("二年级")
                || value.contains("三年级")
                || value.contains("四年级")
                || value.contains("五年级")
                || value.contains("六年级")) {
            return "小学";
        }
        return "";
    }

    private boolean containsText(String source, String target) {
        String normalizedSource = normalizeForMatch(source);
        String normalizedTarget = normalizeForMatch(target);
        return StringUtils.hasText(normalizedSource) && StringUtils.hasText(normalizedTarget)
                && normalizedSource.contains(normalizedTarget);
    }

    private String normalizeForMatch(String text) {
        return stringValue(text)
                .replace("（", "(")
                .replace("）", ")")
                .replaceAll("\\s+", "")
                .toLowerCase(Locale.ROOT);
    }

    private String resolveErrorMessage(Map<String, Object> root, String fallback) {
        String msg = stringValue(root.get("msg"));
        return StringUtils.hasText(msg) ? msg : fallback;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private Integer asNullableInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private int asInt(Object value, int defaultValue) {
        Integer parsed = asNullableInt(value);
        return parsed == null ? defaultValue : parsed;
    }

    private int clampCount(Integer value, int defaultValue) {
        int resolved = value == null ? defaultValue : value;
        if (resolved <= 0) {
            return defaultValue;
        }
        return Math.min(resolved, 10);
    }
}
