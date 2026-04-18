package com.edu.javasb_back.service.support;

import com.aliyun.ocr_api20210707.Client;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperCutRequest;
import com.aliyun.ocr_api20210707.models.RecognizeEduPaperCutResponse;
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
    private static final Map<String, String> SUBJECT_CODE_MAP = createSubjectCodeMap();

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private ObjectMapper objectMapper;

    public SegmentResult segmentPaper(Path paperPath, String subjectName, String imageType) {
        if (paperPath == null || !Files.exists(paperPath)) {
            throw new IllegalArgumentException("待识别试卷不存在");
        }
        if (!StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeyId())
                || !StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeySecret())) {
            throw new IllegalArgumentException("阿里云 OCR AccessKey 未配置，请先在后端全局配置中设置");
        }

        String resolvedSubject = resolveSubject(subjectName);
        String resolvedImageType = resolveImageType(imageType);
        String cutType = resolveCutType();

        try (InputStream inputStream = Files.newInputStream(paperPath)) {
            Client client = createClient();
            RecognizeEduPaperCutRequest request = new RecognizeEduPaperCutRequest();
            request.setBody(inputStream);
            request.setSubject(resolvedSubject);
            request.setImageType(resolvedImageType);
            request.setCutType(cutType);
            if (globalConfigProperties.getAliyunOcrOutputOriCoord() != null) {
                request.setOutputOricoord(globalConfigProperties.getAliyunOcrOutputOriCoord());
            }

            RecognizeEduPaperCutResponse response = client.recognizeEduPaperCut(request);
            if (response == null || response.getBody() == null) {
                throw new IllegalStateException("阿里云 OCR 未返回有效结果");
            }

            String code = response.getBody().getCode();
            if (StringUtils.hasText(code) && !"200".equals(code)) {
                String message = StringUtils.hasText(response.getBody().getMessage())
                        ? response.getBody().getMessage()
                        : "阿里云 OCR 识别失败";
                throw new IllegalStateException(message);
            }

            String data = response.getBody().getData();
            if (!StringUtils.hasText(data)) {
                throw new IllegalStateException("阿里云 OCR 未返回题目坐标数据");
            }

            SegmentResult result = new SegmentResult();
            result.setRequestId(response.getBody().getRequestId());
            result.setOcrSubject(resolvedSubject);
            result.setImageType(resolvedImageType);
            result.setCutType(cutType);
            result.setRegions(parseRegions(data));
            return result;
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("阿里云 OCR 调用失败: " + ex.getMessage(), ex);
        }
    }

    private Client createClient() throws Exception {
        Config config = new Config();
        String ak = globalConfigProperties.getAliyunOcrAccessKeyId();
        String sk = globalConfigProperties.getAliyunOcrAccessKeySecret();
        config.setAccessKeyId(ak != null ? ak.trim() : null);
        config.setAccessKeySecret(sk != null ? sk.trim() : null);
        config.setEndpoint(globalConfigProperties.getAliyunOcrEndpoint());
        return new Client(config);
    }

    private List<Map<String, Object>> parseRegions(String data) throws Exception {
        JsonNode root = objectMapper.readTree(data);
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

                Map<String, Object> region = new LinkedHashMap<>();
                region.put("id", createRegionId());
                region.put("questionNo", resolveQuestionNo(subjectNode, sortOrder));
                region.put("questionType", "");
                region.put("knowledgePoint", "");
                region.put("score", null);
                region.put("remark", "AI自动切割");
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
        if (!node.isArray()) {
            return boundingBox;
        }
        for (JsonNode item : node) {
            JsonNode posNode = item.path("pos");
            if (!posNode.isArray()) {
                continue;
            }
            for (JsonNode pointNode : posNode) {
                Double x = resolvePointAxis(pointNode, "x", 0);
                Double y = resolvePointAxis(pointNode, "y", 1);
                if (x == null || y == null) {
                    continue;
                }
                boundingBox.include(x, y);
            }
        }
        return boundingBox;
    }

    private Double resolvePointAxis(JsonNode pointNode, String fieldName, int arrayIndex) {
        if (pointNode == null || pointNode.isMissingNode() || pointNode.isNull()) {
            return null;
        }
        if (pointNode.isObject() && pointNode.has(fieldName)) {
            return pointNode.path(fieldName).asDouble();
        }
        if (pointNode.isArray() && pointNode.size() > arrayIndex) {
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

    private String resolveCutType() {
        String cutType = globalConfigProperties.getAliyunOcrCutType();
        return StringUtils.hasText(cutType) ? cutType.trim() : "question";
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
