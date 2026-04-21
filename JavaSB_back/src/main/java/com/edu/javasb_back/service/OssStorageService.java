package com.edu.javasb_back.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.OSSObject;
import com.edu.javasb_back.config.GlobalConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@Service
public class OssStorageService {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private OSS ossClient;

    @Value("${aliyun.oss.bucket}")
    private String bucket;

    @Value("${aliyun.oss.cdn-base-url}")
    private String cdnBaseUrl;

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
        execute(client -> {
            ObjectMetadata metadata = new ObjectMetadata();
            if (contentLength >= 0) {
                metadata.setContentLength(contentLength);
            }
            if (StringUtils.hasText(contentType)) {
                metadata.setContentType(contentType);
            }
            client.putObject(bucket, normalizedKey, inputStream, metadata);
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
        return execute(client -> {
            try (OSSObject object = client.getObject(bucket, objectKey);
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
        return execute(client -> {
            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucket, normalizedKey, HttpMethod.PUT);
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
        String trimmedUrl = url.trim();
        String baseUrl = normalizedBaseUrl();
        if (!StringUtils.hasText(baseUrl) || !trimmedUrl.startsWith(baseUrl)) {
            return null;
        }
        String rawObjectKey = trimmedUrl.substring(baseUrl.length()).trim();
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
        String baseUrl = cdnBaseUrl;
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

    private void validateConfig() {
        if (!StringUtils.hasText(bucket) || !StringUtils.hasText(normalizedBaseUrl())) {
            throw new IllegalStateException("OSS 配置不完整，请检查 aliyun.oss.bucket 和 aliyun.oss.cdn-base-url");
        }
    }

    private <T> T execute(OssCallback<T> callback) throws IOException {
        validateConfig();
        try {
            return callback.execute(ossClient);
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("OSS 操作失败: " + e.getMessage(), e);
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
