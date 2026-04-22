package com.edu.javasb_back.service.support;

import com.aliyun.ocr_api20210707.Client;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperCutRequest;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperCutResponse;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperStructedRequest;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperStructedResponse;
import com.aliyun.ocr_api20210707.models.RecognizeEduQuestionOcrRequest;
import com.aliyun.ocr_api20210707.models.RecognizeEduQuestionOcrResponse;
import com.aliyun.teaopenapi.models.Config;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AliyunPaperOcrService {

    private static final Pattern QUESTION_NUMBER_PATTERN = Pattern.compile("(\\d+)");
    private static final Pattern SCORE_PATTERN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*分");
    private static final Map<String, String> SUBJECT_CODE_MAP = createSubjectCodeMap();

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private ObjectMapper objectMapper;

    public SegmentResult segmentPaper(Path paperPath, String subjectName, String imageType, String cutType) {
        if (paperPath == null || !Files.exists(paperPath)) {
            throw new IllegalArgumentException("待识别试卷不存在");
        }
        if (!StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeyId())
                || !StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeySecret())) {
            throw new IllegalArgumentException("阿里云 OCR AccessKey 未配置，请先在后端全局配置中设置");
        }

        String resolvedSubject = resolveSubject(subjectName);
        String resolvedImageType = resolveImageType(imageType);
        String resolvedCutType = resolveCutType(cutType);

        try {
            return executeWithRetry(() -> {
                Client client = createClient();
                StructedCallResult structedCallResult = callPaperStructed(client, paperPath, resolvedSubject);
                List<Map<String, Object>> regions = parseStructuredRegions(structedCallResult.data());
                if (regions.isEmpty()) {
                    regions = callPaperCut(client, paperPath, resolvedSubject, resolvedImageType, resolvedCutType);
                }

                SegmentResult result = new SegmentResult();
                result.setRequestId(structedCallResult.requestId());
                result.setOcrSubject(resolvedSubject);
                result.setImageType(resolvedImageType);
                result.setCutType(resolvedCutType);
                result.setRegions(regions);
                return result;
            });
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("阿里云 OCR 调用失败: " + ex.getMessage(), ex);
        }
    }

    public QuestionOcrResult recognizeQuestion(Path questionPath) {
        if (questionPath == null || !Files.exists(questionPath)) {
            throw new IllegalArgumentException("待识别题目不存在");
        }
        if (!StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeyId())
                || !StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeySecret())) {
            throw new IllegalArgumentException("阿里云 OCR AccessKey 未配置，请先在后端全局配置中设置");
        }

        try {
            return executeWithRetry(() -> {
                try (InputStream inputStream = Files.newInputStream(questionPath)) {
                    Client client = createClient();
                    RecognizeEduQuestionOcrRequest request = new RecognizeEduQuestionOcrRequest();
                    request.setBody(inputStream);
                    request.setNeedRotate(Boolean.TRUE);

                    RecognizeEduQuestionOcrResponse response = client.recognizeEduQuestionOcr(request);
                    if (response == null || response.getBody() == null) {
                        throw new IllegalStateException("阿里云题目 OCR 未返回有效结果");
                    }

                    String code = response.getBody().getCode();
                    if (StringUtils.hasText(code) && !"200".equals(code)) {
                        String message = StringUtils.hasText(response.getBody().getMessage())
                                ? response.getBody().getMessage()
                                : "阿里云题目 OCR 识别失败";
                        throw new IllegalStateException(message);
                    }

                    String data = response.getBody().getData();
                    if (!StringUtils.hasText(data)) {
                        throw new IllegalStateException("阿里云题目 OCR 未返回识别内容");
                    }

                    String questionText = parseQuestionContent(data);
                    QuestionOcrResult result = new QuestionOcrResult();
                    result.setRequestId(response.getBody().getRequestId());
                    result.setQuestionText(questionText);
                    result.setQuestionType(resolveQuestionType("", -1, questionText));
                    result.setScore(resolveScore(questionText));
                    return result;
                }
            });
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("阿里云题目 OCR 调用失败: " + ex.getMessage(), ex);
        }
    }

    private <T> T executeWithRetry(OcrCallable<T> callable) throws Exception {
        int maxRetries = 3;
        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < maxRetries) {
            try {
                return callable.call();
            } catch (Exception e) {
                retryCount++;
                lastException = e;
                if (retryCount >= maxRetries) {
                    break;
                }
                try {
                    Thread.sleep(2000); // OCR retries might need longer delay
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        throw lastException;
    }

    @FunctionalInterface
    private interface OcrCallable<T> {
        T call() throws Exception;
    }

    private Client createClient() throws Exception {
        Config config = new Config();
        String ak = globalConfigProperties.getAliyunOcrAccessKeyId();
        String sk = globalConfigProperties.getAliyunOcrAccessKeySecret();
        config.setAccessKeyId(ak != null ? ak.trim() : null);
        config.setAccessKeySecret(sk != null ? sk.trim() : null);
        config.setEndpoint(globalConfigProperties.getAliyunOcrEndpoint());
        if (globalConfigProperties.getAliyunOcrConnectTimeout() != null) {
            config.setConnectTimeout(globalConfigProperties.getAliyunOcrConnectTimeout());
        }
        if (globalConfigProperties.getAliyunOcrReadTimeout() != null) {
            config.setReadTimeout(globalConfigProperties.getAliyunOcrReadTimeout());
        }
        return new Client(config);
    }

    private StructedCallResult callPaperStructed(Client client, Path paperPath, String subjectCode) throws Exception {
        try (InputStream inputStream = Files.newInputStream(paperPath)) {
            RecognizeEduPaperStructedRequest request = new RecognizeEduPaperStructedRequest();
            request.setBody(inputStream);
            request.setSubject(subjectCode);
            request.setNeedRotate(Boolean.TRUE);
            if (globalConfigProperties.getAliyunOcrOutputOriCoord() != null) {
                request.setOutputOricoord(globalConfigProperties.getAliyunOcrOutputOriCoord());
            }
            RecognizeEduPaperStructedResponse response = client.recognizeEduPaperStructed(request);
            if (response == null || response.getBody() == null) {
                throw new IllegalStateException("阿里云结构化 OCR 未返回有效结果");
            }
            String code = response.getBody().getCode();
            if (StringUtils.hasText(code) && !"200".equals(code)) {
                String message = StringUtils.hasText(response.getBody().getMessage())
                        ? response.getBody().getMessage()
                        : "阿里云结构化 OCR 识别失败";
                throw new IllegalStateException(message);
            }
            if (!StringUtils.hasText(response.getBody().getData())) {
                throw new IllegalStateException("阿里云结构化 OCR 未返回题目结构数据");
            }
            return new StructedCallResult(response.getBody().getRequestId(), response.getBody().getData());
        }
    }

    private List<Map<String, Object>> callPaperCut(
            Client client,
            Path paperPath,
            String subjectCode,
            String imageType,
            String cutType) throws Exception {
        try (InputStream inputStream = Files.newInputStream(paperPath)) {
            RecognizeEduPaperCutRequest request = new RecognizeEduPaperCutRequest();
            request.setBody(inputStream);
            request.setSubject(subjectCode);
            request.setImageType(imageType);
            request.setCutType(cutType);
            if (globalConfigProperties.getAliyunOcrOutputOriCoord() != null) {
                request.setOutputOricoord(globalConfigProperties.getAliyunOcrOutputOriCoord());
            }
            RecognizeEduPaperCutResponse response = client.recognizeEduPaperCut(request);
            if (response == null || response.getBody() == null) {
                throw new IllegalStateException("阿里云切题 OCR 未返回有效结果");
            }
            String code = response.getBody().getCode();
            if (StringUtils.hasText(code) && !"200".equals(code)) {
                String message = StringUtils.hasText(response.getBody().getMessage())
                        ? response.getBody().getMessage()
                        : "阿里云切题 OCR 识别失败";
                throw new IllegalStateException(message);
            }
            if (!StringUtils.hasText(response.getBody().getData())) {
                throw new IllegalStateException("阿里云切题 OCR 未返回题目坐标数据");
            }
            return parseCutRegions(response.getBody().getData());
        }
    }

    private List<Map<String, Object>> parseStructuredRegions(String data) throws Exception {
        JsonNode root = unwrapPayloadNode(objectMapper.readTree(data));
        double pageWidth = positive(root.path("orgWidth").asDouble(root.path("width").asDouble(0D)));
        double pageHeight = positive(root.path("orgHeight").asDouble(root.path("height").asDouble(0D)));
        if (pageWidth <= 0 || pageHeight <= 0) {
            return new ArrayList<>();
        }

        return parsePartInfoRegions(root.path("part_info"), pageWidth, pageHeight);
    }

    private List<Map<String, Object>> parsePartInfoRegions(JsonNode partInfoNode, double pageWidth, double pageHeight) {
        if (!partInfoNode.isArray()) {
            return new ArrayList<>();
        }

        List<Map<String, Object>> regions = new ArrayList<>();
        int sortOrder = 1;
        for (JsonNode partNode : partInfoNode) {
            String partTitle = partNode.path("part_title").asText("");
            JsonNode subjectList = partNode.path("subject_list");
            if (!subjectList.isArray()) {
                continue;
            }
            for (JsonNode subjectNode : subjectList) {
                BoundingBox boundingBox = extractBoundingBox(subjectNode.path("pos_list"));
                if (!boundingBox.valid()) {
                    boundingBox = extractBoundingBox(subjectNode.path("element_list"));
                }
                if (!boundingBox.valid()) {
                    continue;
                }

                String questionText = subjectNode.path("text").asText("").trim();
                int questionTypeCode = subjectNode.path("type").asInt(-1);
                String questionType = resolveQuestionType(partTitle, questionTypeCode, questionText);
                Map<String, Object> region = new LinkedHashMap<>();
                region.put("id", createRegionId());
                region.put("questionNo", resolveStructuredQuestionNo(subjectNode, questionText, sortOrder));
                region.put("questionType", questionType);
                region.put("knowledgePoint", "");
                region.put("questionText", questionText);
                region.put("score", resolveScore(questionText));
                region.put("sortOrder", sortOrder);
                region.put("x", roundRatio(boundingBox.getMinX() / pageWidth));
                region.put("y", roundRatio(boundingBox.getMinY() / pageHeight));
                region.put("width", roundRatio((boundingBox.getMaxX() - boundingBox.getMinX()) / pageWidth));
                region.put("height", roundRatio((boundingBox.getMaxY() - boundingBox.getMinY()) / pageHeight));
                regions.add(region);
                sortOrder++;
            }
        }
        return regions;
    }

    private List<Map<String, Object>> parseCutRegions(String data) throws Exception {
        JsonNode root = unwrapPayloadNode(objectMapper.readTree(data));
        JsonNode pageList = root.path("page_list");
        if (!pageList.isArray() || pageList.isEmpty()) {
            return new ArrayList<>();
        }

        List<Map<String, Object>> regions = new ArrayList<>();
        int sortOrder = 1;
        for (JsonNode pageNode : pageList) {
            double pageWidth = positive(pageNode.path("width").asDouble(0D));
            double pageHeight = positive(pageNode.path("height").asDouble(0D));
            if (pageWidth <= 0 || pageHeight <= 0) {
                continue;
            }

            JsonNode subjectList = pageNode.path("subject_list");
            if (!subjectList.isArray()) {
                continue;
            }

            for (JsonNode subjectNode : subjectList) {
                BoundingBox boundingBox = extractBoundingBox(subjectNode.path("content_list_info"));
                if (!boundingBox.valid()) {
                    boundingBox = extractBoundingBox(subjectNode.path("prism_wordsInfo"));
                }
                if (!boundingBox.valid()) {
                    continue;
                }

                String questionText = resolveQuestionText(subjectNode);
                if (!shouldKeepCutRegion(subjectNode, boundingBox, pageWidth, pageHeight, questionText)) {
                    continue;
                }

                Map<String, Object> region = new LinkedHashMap<>();
                region.put("id", createRegionId());
                region.put("questionNo", resolveQuestionNo(subjectNode, sortOrder));
                region.put("questionType", resolveQuestionType("", -1, questionText));
                region.put("knowledgePoint", "");
                region.put("questionText", questionText);
                region.put("score", resolveScore(questionText));
                region.put("sortOrder", sortOrder);
                region.put("x", roundRatio(boundingBox.getMinX() / pageWidth));
                region.put("y", roundRatio(boundingBox.getMinY() / pageHeight));
                region.put("width", roundRatio((boundingBox.getMaxX() - boundingBox.getMinX()) / pageWidth));
                region.put("height", roundRatio((boundingBox.getMaxY() - boundingBox.getMinY()) / pageHeight));
                regions.add(region);
                sortOrder++;
            }
        }
        return regions;
    }

    private BoundingBox extractBoundingBox(JsonNode node) {
        BoundingBox boundingBox = new BoundingBox();
        collectBoundingBox(node, boundingBox, false);
        return boundingBox;
    }

    private void collectBoundingBox(JsonNode node, BoundingBox boundingBox, boolean pointContext) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return;
        }
        Double x = resolvePointAxis(node, "x", 0, pointContext);
        Double y = resolvePointAxis(node, "y", 1, pointContext);
        if (x != null && y != null) {
            boundingBox.include(x, y);
            return;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                collectBoundingBox(item, boundingBox, pointContext);
            }
            return;
        }
        if (node.isObject()) {
            if (node.has("pos")) {
                collectBoundingBox(node.path("pos"), boundingBox, true);
                return;
            }
            if (node.has("points")) {
                collectBoundingBox(node.path("points"), boundingBox, true);
                return;
            }
            if (node.has("pos_list")) {
                collectBoundingBox(node.path("pos_list"), boundingBox, false);
                return;
            }
            if (node.has("element_list")) {
                collectBoundingBox(node.path("element_list"), boundingBox, false);
                return;
            }
            if (pointContext) {
                return;
            }
            node.fields().forEachRemaining(entry -> {
                String key = entry.getKey();
                if ("box".equals(key) || "bbox".equals(key) || "rect".equals(key)) {
                    return;
                }
                collectBoundingBox(entry.getValue(), boundingBox, false);
            });
        }
    }

    private Double resolvePointAxis(JsonNode pointNode, String fieldName, int arrayIndex, boolean pointContext) {
        if (pointNode == null || pointNode.isMissingNode() || pointNode.isNull()) {
            return null;
        }
        if (pointNode.isObject() && pointNode.size() <= 2 && pointNode.has("x") && pointNode.has("y")) {
            return pointNode.path(fieldName).asDouble();
        }
        if (pointNode.isArray()
                && pointNode.size() == 2
                && pointNode.get(0).isNumber()
                && pointNode.get(1).isNumber()
                && pointNode.size() > arrayIndex) {
            return pointNode.get(arrayIndex).asDouble();
        }
        if (pointNode.isArray() && pointContext && pointNode.size() > arrayIndex) {
            return pointNode.get(arrayIndex).asDouble();
        }
        return null;
    }

    private String resolveQuestionNo(JsonNode subjectNode, int sortOrder) {
        JsonNode idsNode = subjectNode.path("ids");
        if (idsNode.isArray()) {
            for (JsonNode item : idsNode) {
                String normalized = formatQuestionNo(item.asText(), sortOrder);
                if (StringUtils.hasText(normalized)) {
                    return normalized;
                }
            }
        }

        JsonNode prismWordsInfo = subjectNode.path("prism_wordsInfo");
        if (prismWordsInfo.isArray()) {
            for (JsonNode item : prismWordsInfo) {
                String normalized = formatQuestionNo(item.path("word").asText(""), sortOrder);
                if (StringUtils.hasText(normalized)) {
                    return normalized;
                }
            }
        }
        return "第" + sortOrder + "题";
    }

    private String resolveQuestionText(JsonNode subjectNode) {
        String text = subjectNode.path("text").asText("");
        if (StringUtils.hasText(text)) {
            return text.trim();
        }

        JsonNode prismWordsInfo = subjectNode.path("prism_wordsInfo");
        if (!prismWordsInfo.isArray()) {
            return "";
        }

        List<String> words = new ArrayList<>();
        for (JsonNode item : prismWordsInfo) {
            String word = item.path("word").asText("");
            if (StringUtils.hasText(word)) {
                words.add(word.trim());
            }
        }
        return String.join("", words).trim();
    }

    private boolean shouldKeepCutRegion(
            JsonNode subjectNode,
            BoundingBox boundingBox,
            double pageWidth,
            double pageHeight,
            String questionText) {
        double width = boundingBox.getMaxX() - boundingBox.getMinX();
        double height = boundingBox.getMaxY() - boundingBox.getMinY();
        double widthRatio = pageWidth <= 0 ? 0D : width / pageWidth;
        double heightRatio = pageHeight <= 0 ? 0D : height / pageHeight;
        boolean hasQuestionNo = hasRecognizableQuestionNo(subjectNode);
        String normalizedText = StringUtils.hasText(questionText)
                ? questionText.replaceAll("\\s+", "")
                : "";

        if (width < 40 || height < 18) {
            return false;
        }
        if (!hasQuestionNo && widthRatio < 0.03 && heightRatio < 0.03) {
            return false;
        }
        if (!hasQuestionNo && normalizedText.length() < 4 && widthRatio < 0.08) {
            return false;
        }
        return true;
    }

    private boolean hasRecognizableQuestionNo(JsonNode subjectNode) {
        JsonNode idsNode = subjectNode.path("ids");
        if (idsNode.isArray()) {
            for (JsonNode item : idsNode) {
                if (StringUtils.hasText(item.asText("")) && QUESTION_NUMBER_PATTERN.matcher(item.asText("")).find()) {
                    return true;
                }
            }
        }
        return false;
    }

    private String resolveStructuredQuestionNo(JsonNode subjectNode, String questionText, int fallback) {
        String normalized = formatQuestionNo(questionText, fallback);
        if (StringUtils.hasText(normalized)) {
            return normalized;
        }
        int subjectIndex = subjectNode.path("index").asInt(0);
        return subjectIndex > 0 ? "第" + subjectIndex + "题" : "第" + fallback + "题";
    }

    private String formatQuestionNo(String raw, int fallback) {
        if (!StringUtils.hasText(raw)) {
            return "第" + fallback + "题";
        }
        Matcher matcher = QUESTION_NUMBER_PATTERN.matcher(raw);
        if (matcher.find()) {
            return "第" + matcher.group(1) + "题";
        }
        return "第" + fallback + "题";
    }

    private String resolveSubject(String subjectName) {
        String normalized = StringUtils.hasText(subjectName) ? subjectName.trim() : "";
        String subjectCode = SUBJECT_CODE_MAP.get(normalized);
        if (StringUtils.hasText(subjectCode)) {
            return subjectCode;
        }
        String defaultSubject = globalConfigProperties.getAliyunOcrSubjectDefault();
        return StringUtils.hasText(defaultSubject) ? defaultSubject.trim() : "default";
    }

    private String resolveImageType(String imageType) {
        String resolved = StringUtils.hasText(imageType) ? imageType.trim() : globalConfigProperties.getAliyunOcrImageType();
        return StringUtils.hasText(resolved) ? resolved : "scan";
    }

    private String resolveCutType(String cutType) {
        if (StringUtils.hasText(cutType)) {
            return cutType.trim();
        }
        String configuredCutType = globalConfigProperties.getAliyunOcrCutType();
        return StringUtils.hasText(configuredCutType) ? configuredCutType.trim() : "question";
    }

    private String resolveQuestionType(String partTitle, int typeCode, String questionText) {
        String normalizedByTitle = normalizeQuestionType(partTitle);
        if (StringUtils.hasText(normalizedByTitle)) {
            return normalizedByTitle;
        }
        String normalizedByCode = normalizeQuestionTypeCode(typeCode);
        if (StringUtils.hasText(normalizedByCode)) {
            return normalizedByCode;
        }
        return inferQuestionTypeByText(questionText);
    }

    private String normalizeQuestionType(String rawTitle) {
        String normalized = StringUtils.hasText(rawTitle) ? rawTitle.replace(" ", "").trim() : "";
        if (!StringUtils.hasText(normalized)) {
            return "";
        }
        if (normalized.contains("选择")) return "选择题";
        if (normalized.contains("填空")) return "填空题";
        if (normalized.contains("判断")) return "判断题";
        if (normalized.contains("作文")) return "作文题";
        if (normalized.contains("解答")) return "解答题";
        if (normalized.contains("简答") || normalized.contains("问答")) return "简答题";
        if (normalized.contains("计算")) return "计算题";
        if (normalized.contains("作图")) return "作图题";
        if (normalized.contains("连线")) return "连线题";
        if (normalized.contains("应用")) return "应用题";
        return normalized;
    }

    private String normalizeQuestionTypeCode(int typeCode) {
        return switch (typeCode) {
            case 0, 6 -> "选择题";
            case 1, 4, 7 -> "填空题";
            case 5 -> "简答题";
            case 8 -> "应用题";
            case 9 -> "判断题";
            case 10 -> "作图题";
            case 12 -> "计算题";
            case 13 -> "连线题";
            case 14 -> "作文题";
            case 15 -> "解答题";
            case 18 -> "表格题";
            default -> "";
        };
    }

    private String inferQuestionTypeByText(String questionText) {
        String text = StringUtils.hasText(questionText) ? questionText.replace(" ", "") : "";
        if (!StringUtils.hasText(text)) {
            return "";
        }
        if (text.contains("判断") || text.contains("√") || text.contains("×")) return "判断题";
        if (text.matches(".*[A-DＡ-Ｄ][.．、].*") || text.contains("单项选择") || text.contains("多项选择")) return "选择题";
        if (text.contains("填空") || text.contains("____") || text.contains("___")) return "填空题";
        if (text.contains("作文") || text.contains("写作")) return "作文题";
        if (text.contains("简答") || text.contains("问答")) return "简答题";
        if (text.contains("计算")) return "计算题";
        if (text.contains("解答") || text.contains("证明")) return "解答题";
        return "";
    }

    private Double resolveScore(String questionText) {
        if (!StringUtils.hasText(questionText)) {
            return null;
        }
        Matcher matcher = SCORE_PATTERN.matcher(questionText.replace(" ", ""));
        if (!matcher.find()) {
            return null;
        }
        try {
            return Double.parseDouble(matcher.group(1));
        } catch (Exception ignored) {
            return null;
        }
    }

    private String parseQuestionContent(String data) throws Exception {
        JsonNode root = unwrapPayloadNode(objectMapper.readTree(data));
        String content = root.path("content").asText("");
        if (StringUtils.hasText(content)) {
            return content.trim();
        }
        JsonNode wordsNode = root.path("prism_wordsInfo");
        if (!wordsNode.isArray()) {
            return "";
        }
        List<String> words = new ArrayList<>();
        for (JsonNode item : wordsNode) {
            String word = item.path("word").asText("");
            if (StringUtils.hasText(word)) {
                words.add(word.trim());
            }
        }
        return String.join("", words).trim();
    }

    private JsonNode unwrapPayloadNode(JsonNode root) throws Exception {
        if (root == null || root.isMissingNode() || root.isNull()) {
            return root;
        }
        JsonNode payload = root;
        if (payload.isObject() && payload.has("data")) {
            JsonNode dataNode = payload.path("data");
            if (dataNode.isObject() || dataNode.isArray()) {
                payload = dataNode;
            } else if (dataNode.isTextual() && StringUtils.hasText(dataNode.asText())) {
                payload = objectMapper.readTree(dataNode.asText());
            }
        }
        return payload;
    }

    private double positive(double value) {
        return value > 0D ? value : 0D;
    }

    private double roundRatio(double value) {
        double ratio = Math.max(0D, Math.min(value, 1D));
        return Math.round(ratio * 1000000D) / 1000000D;
    }

    private String createRegionId() {
        return "PR" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }

    private static Map<String, String> createSubjectCodeMap() {
        Map<String, String> subjectMap = new LinkedHashMap<>();
        subjectMap.put("语文", "Chinese");
        subjectMap.put("小学语文", "PrimarySchool_Chinese");
        subjectMap.put("初中语文", "JHighSchool_Chinese");
        subjectMap.put("数学", "Math");
        subjectMap.put("小学数学", "PrimarySchool_Math");
        subjectMap.put("初中数学", "JHighSchool_Math");
        subjectMap.put("英语", "English");
        subjectMap.put("小学英语", "PrimarySchool_English");
        subjectMap.put("初中英语", "JHighSchool_English");
        subjectMap.put("物理", "Physics");
        subjectMap.put("初中物理", "JHighSchool_Physics");
        subjectMap.put("化学", "Chemistry");
        subjectMap.put("初中化学", "JHighSchool_Chemistry");
        subjectMap.put("生物", "Biology");
        subjectMap.put("初中生物", "JHighSchool_Biology");
        subjectMap.put("历史", "History");
        subjectMap.put("初中历史", "JHighSchool_History");
        subjectMap.put("地理", "Geography");
        subjectMap.put("初中地理", "JHighSchool_Geography");
        subjectMap.put("政治", "Politics");
        subjectMap.put("初中政治", "JHighSchool_Politics");
        return subjectMap;
    }

    public static class SegmentResult {
        private String requestId;
        private String ocrSubject;
        private String imageType;
        private String cutType;
        private List<Map<String, Object>> regions = new ArrayList<>();

        public String getRequestId() {
            return requestId;
        }

        public void setRequestId(String requestId) {
            this.requestId = requestId;
        }

        public String getOcrSubject() {
            return ocrSubject;
        }

        public void setOcrSubject(String ocrSubject) {
            this.ocrSubject = ocrSubject;
        }

        public String getImageType() {
            return imageType;
        }

        public void setImageType(String imageType) {
            this.imageType = imageType;
        }

        public String getCutType() {
            return cutType;
        }

        public void setCutType(String cutType) {
            this.cutType = cutType;
        }

        public List<Map<String, Object>> getRegions() {
            return regions;
        }

        public void setRegions(List<Map<String, Object>> regions) {
            this.regions = regions;
        }
    }

    public static class QuestionOcrResult {
        private String requestId;
        private String questionText;
        private String questionType;
        private Double score;

        public String getRequestId() {
            return requestId;
        }

        public void setRequestId(String requestId) {
            this.requestId = requestId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public String getQuestionType() {
            return questionType;
        }

        public void setQuestionType(String questionType) {
            this.questionType = questionType;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }
    }

    private record StructedCallResult(
            String requestId,
            String data) {}

    private static class BoundingBox {
        private double minX = Double.MAX_VALUE;
        private double minY = Double.MAX_VALUE;
        private double maxX = Double.MIN_VALUE;
        private double maxY = Double.MIN_VALUE;
        private boolean hasValue = false;

        public void include(double x, double y) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            hasValue = true;
        }

        public boolean valid() {
            return hasValue && maxX > minX && maxY > minY;
        }

        public double getMinX() {
            return minX;
        }

        public double getMinY() {
            return minY;
        }

        public double getMaxX() {
            return maxX;
        }

        public double getMaxY() {
            return maxY;
        }
    }
}
