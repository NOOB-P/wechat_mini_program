package com.edu.javasb_back.service;

import com.aliyun.sts20150401.Client;
import com.aliyun.sts20150401.models.AssumeRoleRequest;
import com.aliyun.sts20150401.models.AssumeRoleResponse;
import com.aliyun.teaopenapi.models.Config;
import com.edu.javasb_back.config.AliyunOssProperties;
import com.edu.javasb_back.config.GlobalConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CourseVideoDirectUploadService {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private AliyunOssProperties aliyunOssProperties;

    public Map<String, Object> createStsSession(String fileName, String contentType) throws Exception {
        validateVideoRequest(fileName, contentType);
        validateConfig();

        String objectKey = buildVideoObjectKey(fileName);
        Map<String, String> credentials = assumeRole("course-video");

        Map<String, Object> data = buildSessionData(credentials);
        data.put("objectKey", objectKey);
        data.put("publicUrl", buildPublicUrl(objectKey));
        return data;
    }

    public Map<String, Object> createExamPaperImportSession(String projectId, String subjectName, String batchId) throws Exception {
        validateExamPaperImportRequest(projectId, subjectName, batchId);
        validateConfig();

        String objectKeyPrefix = buildExamPaperImportPrefix(projectId, subjectName, batchId);
        Map<String, String> credentials = assumeRole("exam-paper-import");

        Map<String, Object> data = buildSessionData(credentials);
        data.put("batchId", batchId);
        data.put("objectKeyPrefix", objectKeyPrefix);
        data.put("publicBaseUrl", buildPublicUrl(""));
        return data;
    }

    private Map<String, Object> buildSessionData(Map<String, String> credentials) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bucket", aliyunOssProperties.getBucket());
        data.put("region", aliyunOssProperties.getRegion());
        data.put("endpoint", aliyunOssProperties.getAccelerateEndpointHost());
        data.put("secure", true);
        data.put("accessKeyId", credentials.get("accessKeyId"));
        data.put("accessKeySecret", credentials.get("accessKeySecret"));
        data.put("securityToken", credentials.get("securityToken"));
        data.put("expiration", credentials.get("expiration"));
        data.put("partSize", resolvePartSize());
        data.put("parallel", resolveParallel());
        data.put("retryMax", resolveRetryMax());
        data.put("timeoutMillis", resolveTimeoutMillis());
        return data;
    }

    private Map<String, String> assumeRole(String scene) throws Exception {
        Config config = new Config()
                .setAccessKeyId(globalConfigProperties.getOssAccessKeyId())
                .setAccessKeySecret(globalConfigProperties.getOssAccessKeySecret())
                .setEndpoint(normalizeEndpointHost(aliyunOssProperties.getStsEndpoint()));

        Client client = new Client(config);
        AssumeRoleRequest request = new AssumeRoleRequest()
                .setRoleArn(aliyunOssProperties.getStsRoleArn())
                .setRoleSessionName(scene + "-" + UUID.randomUUID().toString().replace("-", ""))
                .setDurationSeconds(Long.valueOf(resolveDurationSeconds()));

        AssumeRoleResponse response = client.assumeRole(request);
        if (response.getBody() == null || response.getBody().getCredentials() == null) {
            throw new IllegalStateException("鑾峰彇 OSS STS 涓存椂鍑瘉澶辫触");
        }
        Map<String, String> credentials = new LinkedHashMap<>();
        credentials.put("accessKeyId", response.getBody().getCredentials().getAccessKeyId());
        credentials.put("accessKeySecret", response.getBody().getCredentials().getAccessKeySecret());
        credentials.put("securityToken", response.getBody().getCredentials().getSecurityToken());
        credentials.put("expiration", response.getBody().getCredentials().getExpiration());
        return credentials;
    }

    private Integer resolveDurationSeconds() {
        Integer durationSeconds = aliyunOssProperties.getStsDurationSeconds();
        if (durationSeconds == null) {
            return 3600;
        }
        return Math.max(900, Math.min(durationSeconds, 3600));
    }

    private String buildVideoObjectKey(String fileName) {
        String suffix = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        String baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        String sanitizedBaseName = sanitizeObjectName(baseName, "video");

        LocalDate today = LocalDate.now(ZoneOffset.ofHours(8));
        return "course/video/"
                + today.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"))
                + "/"
                + UUID.randomUUID().toString().replace("-", "")
                + "-"
                + sanitizedBaseName
                + suffix;
    }

    private String buildExamPaperImportPrefix(String projectId, String subjectName, String batchId) {
        return "papers/exam-import/"
                + sanitizePathSegment(projectId, "project")
                + "/"
                + sanitizePathSegment(subjectName, "subject")
                + "/"
                + sanitizePathSegment(batchId, "batch")
                + "/";
    }

    private String buildPublicUrl(String objectKey) {
        String baseUrl = aliyunOssProperties.getNormalizedCdnBaseUrl();
        if (!StringUtils.hasText(baseUrl)) {
            String accelerateBaseUrl = aliyunOssProperties.getNormalizedAccelerateBaseUrl();
            if (StringUtils.hasText(accelerateBaseUrl)) {
                return accelerateBaseUrl + objectKey;
            }
            return "https://" + aliyunOssProperties.getBucket() + "." + aliyunOssProperties.getAccelerateEndpointHost() + "/" + objectKey;
        }
        return baseUrl + objectKey;
    }

    private void validateVideoRequest(String fileName, String contentType) {
        if (!StringUtils.hasText(fileName)) {
            throw new IllegalArgumentException("鏂囦欢鍚嶄笉鑳戒负绌?");
        }
        String lowerFileName = fileName.trim().toLowerCase();
        if (!lowerFileName.endsWith(".mp4")) {
            throw new IllegalArgumentException("浠呮敮鎸?MP4 鏍煎紡");
        }
        if (StringUtils.hasText(contentType) && !"video/mp4".equalsIgnoreCase(contentType.trim())) {
            throw new IllegalArgumentException("浠呮敮鎸?MP4 瑙嗛涓婁紶");
        }
    }

    private void validateExamPaperImportRequest(String projectId, String subjectName, String batchId) {
        if (!StringUtils.hasText(projectId)) {
            throw new IllegalArgumentException("项目 ID 不能为空");
        }
        if (!StringUtils.hasText(subjectName)) {
            throw new IllegalArgumentException("学科名称不能为空");
        }
        if (!StringUtils.hasText(batchId)) {
            throw new IllegalArgumentException("导入批次不能为空");
        }
    }

    private void validateConfig() {
        List<String> missingFields = new ArrayList<>();
        if (!StringUtils.hasText(globalConfigProperties.getOssAccessKeyId())) {
            missingFields.add("app.config.oss-access-key-id");
        }
        if (!StringUtils.hasText(globalConfigProperties.getOssAccessKeySecret())) {
            missingFields.add("app.config.oss-access-key-secret");
        }
        if (!StringUtils.hasText(aliyunOssProperties.getBucket())) {
            missingFields.add("aliyun.oss.bucket");
        }
        if (!StringUtils.hasText(aliyunOssProperties.getRegion())) {
            missingFields.add("aliyun.oss.region");
        }
        if (!StringUtils.hasText(aliyunOssProperties.getAccelerateEndpointHost())) {
            missingFields.add("aliyun.oss.accelerate-endpoint");
        }
        if (!StringUtils.hasText(aliyunOssProperties.getStsEndpoint())) {
            missingFields.add("aliyun.oss.sts-endpoint");
        }
        if (!StringUtils.hasText(aliyunOssProperties.getStsRoleArn())) {
            missingFields.add("aliyun.oss.sts-role-arn");
        }
        if (!missingFields.isEmpty()) {
            throw new IllegalStateException("OSS STS 閰嶇疆涓嶅畬鏁达紝缂哄皯: " + String.join(", ", missingFields));
        }
    }

    private String normalizeEndpointHost(String endpoint) {
        if (!StringUtils.hasText(endpoint)) {
            return "";
        }
        String normalized = endpoint.trim()
                .replaceFirst("^https://", "")
                .replaceFirst("^http://", "")
                .replaceAll("/+$", "");
        String bucketPrefix = aliyunOssProperties.getBucket() + ".";
        if (StringUtils.hasText(aliyunOssProperties.getBucket()) && normalized.startsWith(bucketPrefix)) {
            return normalized.substring(bucketPrefix.length());
        }
        return normalized;
    }

    private long resolvePartSize() {
        if (aliyunOssProperties.getUpload() == null || aliyunOssProperties.getUpload().getMultipartPartSizeBytes() == null) {
            return 1L * 1024L * 1024L;
        }
        return Math.max(1024L * 1024L, aliyunOssProperties.getUpload().getMultipartPartSizeBytes());
    }

    private int resolveParallel() {
        if (aliyunOssProperties.getUpload() == null || aliyunOssProperties.getUpload().getMultipartParallel() == null) {
            return 5;
        }
        return Math.max(1, aliyunOssProperties.getUpload().getMultipartParallel());
    }

    private int resolveRetryMax() {
        if (aliyunOssProperties.getUpload() == null || aliyunOssProperties.getUpload().getRetryMax() == null) {
            return 3;
        }
        return Math.max(1, aliyunOssProperties.getUpload().getRetryMax());
    }

    private long resolveTimeoutMillis() {
        if (aliyunOssProperties.getUpload() == null || aliyunOssProperties.getUpload().getTimeoutMillis() == null) {
            return 600_000L;
        }
        return Math.max(60_000L, aliyunOssProperties.getUpload().getTimeoutMillis());
    }

    private String sanitizePathSegment(String value, String fallback) {
        String sanitized = sanitizeObjectName(value, fallback).replace('-', '_');
        return StringUtils.hasText(sanitized) ? sanitized : fallback;
    }

    private String sanitizeObjectName(String value, String fallback) {
        String sanitized = StringUtils.hasText(value)
                ? value.trim()
                .replaceAll("[^0-9A-Za-z\\u4e00-\\u9fa5_-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "")
                : "";
        return StringUtils.hasText(sanitized) ? sanitized : fallback;
    }
}
