package com.edu.javasb_back.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.OSSObject;
import com.edu.javasb_back.config.GlobalConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class OssStorageService {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    public String upload(MultipartFile file, String objectKey) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }
        try (InputStream inputStream = file.getInputStream()) {
            return upload(
                    inputStream,
                    file.getSize(),
                    objectKey,
                    resolveContentType(file.getOriginalFilename(), file.getContentType())
            );
        }
    }

    public String upload(InputStream inputStream, long contentLength, String objectKey, String contentType) throws IOException {
        String normalizedKey = normalizeObjectKey(objectKey);
        withClient(client -> {
            ObjectMetadata metadata = new ObjectMetadata();
            if (contentLength >= 0) {
                metadata.setContentLength(contentLength);
            }
            if (StringUtils.hasText(contentType)) {
                metadata.setContentType(contentType);
            }
            client.putObject(resolveBucket(), normalizedKey, inputStream, metadata);
            return null;
        });
        return buildUrl(normalizedKey);
    }

    public String uploadBytes(byte[] bytes, String objectKey, String contentType) throws IOException {
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes)) {
            return upload(inputStream, bytes.length, objectKey, contentType);
        }
    }

    public byte[] download(String url) throws IOException {
        String objectKey = extractObjectKey(url);
        if (!StringUtils.hasText(objectKey)) {
            throw new IllegalArgumentException("当前 URL 不是可识别的 OSS 地址");
        }
        return withClient(client -> {
            try (OSSObject object = client.getObject(resolveBucket(), objectKey);
                 InputStream inputStream = object.getObjectContent()) {
                return inputStream.readAllBytes();
            }
        });
    }

    public Path downloadToTempFile(String url) throws IOException {
        byte[] bytes = download(url);
        String suffix = getFileSuffix(url);
        Path tempDir = Paths.get(globalConfigProperties.getUploadTempDir()).toAbsolutePath().normalize();
        Files.createDirectories(tempDir);
        Path tempFile = Files.createTempFile(tempDir, "oss_", suffix);
        Files.write(tempFile, bytes);
        return tempFile;
    }

    public DirectUploadToken createPutUploadToken(String objectKey, String contentType, long expireMillis) throws IOException {
        String normalizedKey = normalizeObjectKey(objectKey);
        long ttl = Math.max(expireMillis, 60_000L);
        return withClient(client -> {
            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(resolveBucket(), normalizedKey, HttpMethod.PUT);
            request.setExpiration(new Date(System.currentTimeMillis() + ttl));
            if (StringUtils.hasText(contentType)) {
                request.setContentType(contentType);
            }
            URL signedUrl = client.generatePresignedUrl(request);
            return new DirectUploadToken(signedUrl.toString(), buildUrl(normalizedKey), normalizedKey, request.getExpiration().getTime());
        });
    }

    public boolean isOssUrl(String url) {
        return StringUtils.hasText(extractObjectKey(url));
    }

    public String extractObjectKey(String url) {
        if (!StringUtils.hasText(url)) {
            return null;
        }
        String normalizedBaseUrl = normalizedBaseUrl();
        if (!StringUtils.hasText(normalizedBaseUrl)) {
            return null;
        }
        String trimmedUrl = url.trim();
        if (!trimmedUrl.startsWith(normalizedBaseUrl)) {
            return null;
        }
        String rawObjectKey = trimmedUrl.substring(normalizedBaseUrl.length()).trim();
        if (!StringUtils.hasText(rawObjectKey)) {
            return null;
        }
        String objectKey = normalizeObjectKey(rawObjectKey);
        return StringUtils.hasText(objectKey) ? objectKey : null;
    }

    public String buildUrl(String objectKey) {
        return normalizedBaseUrl() + normalizeObjectKey(objectKey);
    }

    private String normalizeObjectKey(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            throw new IllegalArgumentException("OSS 对象路径不能为空");
        }
        return objectKey.trim().replace('\\', '/').replaceAll("^/+", "");
    }

    private String normalizedBaseUrl() {
        String baseUrl = globalConfigProperties.getOssPublicBaseUrl();
        if (!StringUtils.hasText(baseUrl)) {
            String bucket = resolveBucket();
            String endpoint = resolveEndpoint();
            baseUrl = "https://" + bucket + "." + endpoint + "/";
        }
        if (!StringUtils.hasText(baseUrl)) {
            return "";
        }
        String normalized = baseUrl.trim();
        return normalized.endsWith("/") ? normalized : normalized + "/";
    }

    private String resolveContentType(String fileName, String explicitContentType) {
        if (StringUtils.hasText(explicitContentType)) {
            return explicitContentType;
        }
        String guessed = URLConnection.guessContentTypeFromName(fileName);
        return StringUtils.hasText(guessed) ? guessed : "application/octet-stream";
    }

    private String getFileSuffix(String url) {
        if (!StringUtils.hasText(url)) {
            return ".tmp";
        }
        int index = url.lastIndexOf('.');
        if (index < 0 || index < url.lastIndexOf('/')) {
            return ".tmp";
        }
        return url.substring(index);
    }

    private OSS createClient() {
        validateConfig();
        String endpoint = resolveEndpoint();
        if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
            endpoint = "https://" + endpoint;
        }
        return new OSSClientBuilder().build(
                endpoint,
                resolveAccessKeyId(),
                resolveAccessKeySecret()
        );
    }

    private void validateConfig() {
        List<String> missing = new ArrayList<>();
        if (!StringUtils.hasText(resolveEndpoint())) {
            missing.add("endpoint");
        }
        if (!StringUtils.hasText(resolveBucket())) {
            missing.add("bucket");
        }
        if (!StringUtils.hasText(resolveAccessKeyId())) {
            missing.add("accessKeyId");
        }
        if (!StringUtils.hasText(resolveAccessKeySecret())) {
            missing.add("accessKeySecret");
        }
        if (!StringUtils.hasText(normalizedBaseUrl())) {
            missing.add("publicBaseUrl");
        }
        if (!missing.isEmpty()) {
            throw new IllegalStateException("OSS 配置不完整，请检查: " + String.join(", ", missing));
        }
    }

    private String resolveEndpoint() {
        if (StringUtils.hasText(globalConfigProperties.getOssEndpoint())) {
            return globalConfigProperties.getOssEndpoint().trim()
                    .replace("https://", "")
                    .replace("http://", "")
                    .replaceAll("/+$", "");
        }
        String host = extractHostFromBaseUrl();
        if (!StringUtils.hasText(host)) {
            return null;
        }
        int dotIndex = host.indexOf('.');
        return dotIndex > 0 && dotIndex < host.length() - 1 ? host.substring(dotIndex + 1) : null;
    }

    private String resolveBucket() {
        if (StringUtils.hasText(globalConfigProperties.getOssBucket())) {
            return globalConfigProperties.getOssBucket().trim();
        }
        String host = extractHostFromBaseUrl();
        if (!StringUtils.hasText(host)) {
            return null;
        }
        int dotIndex = host.indexOf('.');
        return dotIndex > 0 ? host.substring(0, dotIndex) : null;
    }

    private String resolveAccessKeyId() {
        if (StringUtils.hasText(globalConfigProperties.getOssAccessKeyId())) {
            return globalConfigProperties.getOssAccessKeyId().trim();
        }
        return StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeyId())
                ? globalConfigProperties.getAliyunOcrAccessKeyId().trim()
                : null;
    }

    private String resolveAccessKeySecret() {
        if (StringUtils.hasText(globalConfigProperties.getOssAccessKeySecret())) {
            return globalConfigProperties.getOssAccessKeySecret().trim();
        }
        return StringUtils.hasText(globalConfigProperties.getAliyunOcrAccessKeySecret())
                ? globalConfigProperties.getAliyunOcrAccessKeySecret().trim()
                : null;
    }

    private String extractHostFromBaseUrl() {
        String baseUrl = globalConfigProperties.getOssPublicBaseUrl();
        if (!StringUtils.hasText(baseUrl)) {
            return null;
        }
        try {
            URI uri = URI.create(baseUrl.trim());
            return uri.getHost();
        } catch (Exception ignored) {
            return null;
        }
    }

    private <T> T withClient(OssCallback<T> callback) throws IOException {
        OSS client = createClient();
        try {
            return callback.execute(client);
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("OSS 操作失败: " + e.getMessage(), e);
        } finally {
            client.shutdown();
        }
    }

    @FunctionalInterface
    private interface OssCallback<T> {
        T execute(OSS client) throws Exception;
    }

    public record DirectUploadToken(
            String signedUrl,
            String publicUrl,
            String objectKey,
            long expireAt
    ) {}
}
