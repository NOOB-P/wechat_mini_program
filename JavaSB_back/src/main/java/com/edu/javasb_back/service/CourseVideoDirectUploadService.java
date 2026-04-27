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
        validateRequest(fileName, contentType);
        validateConfig();

        String objectKey = buildObjectKey(fileName);
        Map<String, String> credentials = assumeRole();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bucket", aliyunOssProperties.getBucket());
        data.put("region", aliyunOssProperties.getRegion());
        data.put("endpoint", aliyunOssProperties.getAccelerateEndpointHost());
        data.put("secure", true);
        data.put("objectKey", objectKey);
        data.put("publicUrl", buildPublicUrl(objectKey));
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

    private Map<String, String> assumeRole() throws Exception {
        Config config = new Config()
                .setAccessKeyId(globalConfigProperties.getOssAccessKeyId())
                .setAccessKeySecret(globalConfigProperties.getOssAccessKeySecret())
                .setEndpoint(normalizeEndpointHost(aliyunOssProperties.getStsEndpoint()));

        Client client = new Client(config);
        AssumeRoleRequest request = new AssumeRoleRequest()
                .setRoleArn(aliyunOssProperties.getStsRoleArn())
                .setRoleSessionName("course-video-" + UUID.randomUUID().toString().replace("-", ""))
                .setDurationSeconds(Long.valueOf(resolveDurationSeconds()));

        AssumeRoleResponse response = client.assumeRole(request);
        if (response.getBody() == null || response.getBody().getCredentials() == null) {
            throw new IllegalStateException("获取 OSS STS 临时凭证失败");
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

    private String buildObjectKey(String fileName) {
        String suffix = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        String baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        String sanitizedBaseName = baseName
                .trim()
                .replaceAll("[^0-9A-Za-z\\u4e00-\\u9fa5_-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        if (!StringUtils.hasText(sanitizedBaseName)) {
            sanitizedBaseName = "video";
        }

        LocalDate today = LocalDate.now(ZoneOffset.ofHours(8));
        return "course/video/"
                + today.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"))
                + "/"
                + UUID.randomUUID().toString().replace("-", "")
                + "-"
                + sanitizedBaseName
                + suffix;
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

    private void validateRequest(String fileName, String contentType) {
        if (!StringUtils.hasText(fileName)) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        String lowerFileName = fileName.trim().toLowerCase();
        if (!lowerFileName.endsWith(".mp4")) {
            throw new IllegalArgumentException("仅支持 MP4 格式");
        }
        if (StringUtils.hasText(contentType) && !"video/mp4".equalsIgnoreCase(contentType.trim())) {
            throw new IllegalArgumentException("仅支持 MP4 视频上传");
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
            throw new IllegalStateException("OSS STS 配置不完整，缺少: " + String.join(", ", missingFields));
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
}
