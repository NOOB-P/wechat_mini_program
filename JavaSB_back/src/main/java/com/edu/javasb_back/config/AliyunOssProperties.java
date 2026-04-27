package com.edu.javasb_back.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliyunOssProperties {

    private String endpoint = "oss-cn-hangzhou.aliyuncs.com";
    private String bucket;
    private String cdnBaseUrl;
    private String region = "oss-cn-hangzhou";
    private String accelerateEndpoint = "oss-accelerate.aliyuncs.com";
    private String accelerateBaseUrl;
    private String stsEndpoint = "sts.cn-hangzhou.aliyuncs.com";
    private String stsRoleArn;
    private Integer stsDurationSeconds = 3600;
    private Upload upload = new Upload();

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getCdnBaseUrl() {
        return cdnBaseUrl;
    }

    public void setCdnBaseUrl(String cdnBaseUrl) {
        this.cdnBaseUrl = cdnBaseUrl;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getAccelerateEndpoint() {
        return accelerateEndpoint;
    }

    public void setAccelerateEndpoint(String accelerateEndpoint) {
        this.accelerateEndpoint = accelerateEndpoint;
    }

    public String getAccelerateBaseUrl() {
        return accelerateBaseUrl;
    }

    public void setAccelerateBaseUrl(String accelerateBaseUrl) {
        this.accelerateBaseUrl = accelerateBaseUrl;
    }

    public String getStsEndpoint() {
        return stsEndpoint;
    }

    public void setStsEndpoint(String stsEndpoint) {
        this.stsEndpoint = stsEndpoint;
    }

    public String getStsRoleArn() {
        return stsRoleArn;
    }

    public void setStsRoleArn(String stsRoleArn) {
        this.stsRoleArn = stsRoleArn;
    }

    public Integer getStsDurationSeconds() {
        return stsDurationSeconds;
    }

    public void setStsDurationSeconds(Integer stsDurationSeconds) {
        this.stsDurationSeconds = stsDurationSeconds;
    }

    public Upload getUpload() {
        return upload;
    }

    public void setUpload(Upload upload) {
        this.upload = upload;
    }

    public String getEndpointHost() {
        return normalizeHost(endpoint);
    }

    public String getAccelerateEndpointHost() {
        return normalizeHost(accelerateEndpoint);
    }

    public String getNormalizedCdnBaseUrl() {
        return normalizeBaseUrl(cdnBaseUrl);
    }

    public String getNormalizedAccelerateBaseUrl() {
        return normalizeBaseUrl(accelerateBaseUrl);
    }

    private String normalizeHost(String source) {
        if (!StringUtils.hasText(source)) {
            return "";
        }
        String normalized = source.trim()
                .replaceFirst("^https://", "")
                .replaceFirst("^http://", "")
                .replaceAll("/+$", "");
        if (StringUtils.hasText(bucket)) {
            String bucketPrefix = bucket.trim() + ".";
            if (normalized.startsWith(bucketPrefix)) {
                return normalized.substring(bucketPrefix.length());
            }
        }
        return normalized;
    }

    private String normalizeBaseUrl(String source) {
        if (!StringUtils.hasText(source)) {
            return "";
        }
        String normalized = source.trim();
        if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            normalized = "https://" + normalized.replaceFirst("^/+", "");
        }
        return normalized.endsWith("/") ? normalized : normalized + "/";
    }

    public static class Upload {
        private Long multipartPartSizeBytes = 1L * 1024L * 1024L;
        private Integer multipartParallel = 5;
        private Integer retryMax = 3;
        private Long timeoutMillis = 600_000L;

        public Long getMultipartPartSizeBytes() {
            return multipartPartSizeBytes;
        }

        public void setMultipartPartSizeBytes(Long multipartPartSizeBytes) {
            this.multipartPartSizeBytes = multipartPartSizeBytes;
        }

        public Integer getMultipartParallel() {
            return multipartParallel;
        }

        public void setMultipartParallel(Integer multipartParallel) {
            this.multipartParallel = multipartParallel;
        }

        public Integer getRetryMax() {
            return retryMax;
        }

        public void setRetryMax(Integer retryMax) {
            this.retryMax = retryMax;
        }

        public Long getTimeoutMillis() {
            return timeoutMillis;
        }

        public void setTimeoutMillis(Long timeoutMillis) {
            this.timeoutMillis = timeoutMillis;
        }
    }
}
