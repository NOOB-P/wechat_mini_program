package com.edu.javasb_back.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 全局配置类，用于读取 application.properties 中的相关配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.config")
public class GlobalConfigProperties {

    /**
     * 默认初始密码
     */
    private String defaultPassword = "123456";

    /**
     * JWT 加密密钥
     */
    private String jwtSecret = "default_secret_key_please_change_in_production";

    /**
     * JWT 过期时间 (毫秒)，默认24小时
     */
    private Long jwtExpiration = 86400000L;

    /**
     * 微信小程序 AppID
     */
    private String wechatAppId;

    /**
     * 微信小程序 AppSecret
     */
    private String wechatAppSecret;

    /**
     * 文件上传目录
     */
    private String uploadDir = "/upload/";

    /**
     * 试卷存储目录
     */
    private String paperDir = "src/main/resources/uploads/papers/";

    /**
     * 课程封面存储目录
     */
    private String courseCoverDir = "src/main/resources/uploads/course/cover/";

    /**
     * 课程视频存储目录
     */
    private String courseVideoDir = "src/main/resources/uploads/course/video/";

    /**
     * 上传/预览/OCR 临时文件目录
     */
    private String uploadTempDir = System.getProperty("java.io.tmpdir") + "/edu-upload-temp/";

    /**
     * 阿里云 OSS Endpoint
     */
    private String ossEndpoint = "oss-cn-hangzhou.aliyuncs.com";

    /**
     * 阿里云 OSS Bucket
     */
    private String ossBucket = "back-resources";

    /**
     * 阿里云 OSS AccessKey ID
     */
    private String ossAccessKeyId;

    /**
     * 阿里云 OSS AccessKey Secret
     */
    private String ossAccessKeySecret;

    /**
     * OSS 公网访问根地址
     */
    private String ossPublicBaseUrl = "https://back-resources.oss-cn-hangzhou.aliyuncs.com/";

    /**
     * 通义千问 API Key
     */
    private String qwenApiKey;

    /**
     * 通义千问 Chat Completions 地址
     */
    private String qwenChatUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

    /**
     * 通义千问模型名
     */
    private String qwenModel = "qwen3.6-plus";

    /**
     * AI 报告提示词版本
     */
    private String qwenPromptVersion = "qwen-score-report-v1";

    /**
     * 阿里云 OCR AccessKey ID
     */
    private String aliyunOcrAccessKeyId;

    /**
     * 阿里云 OCR AccessKey Secret
     */
    private String aliyunOcrAccessKeySecret;

    /**
     * 阿里云 OCR 接口 Endpoint
     */
    private String aliyunOcrEndpoint = "ocr-api.cn-hangzhou.aliyuncs.com";

    /**
     * 阿里云试卷切题默认学科
     */
    private String aliyunOcrSubjectDefault = "default";

    /**
     * 阿里云试卷切题默认图片类型
     */
    private String aliyunOcrImageType = "scan";

    /**
     * 阿里云试卷切题默认切割类型
     */
    private String aliyunOcrCutType = "question";

    /**
     * 是否返回原图坐标
     */
    private Boolean aliyunOcrOutputOriCoord = Boolean.FALSE;

    // 手动添加 Getter 和 Setter 方法，以防 Lombok 失效
    public String getCourseCoverDir() { return courseCoverDir; }
    public void setCourseCoverDir(String courseCoverDir) { this.courseCoverDir = courseCoverDir; }

    public String getCourseVideoDir() { return courseVideoDir; }
    public void setCourseVideoDir(String courseVideoDir) { this.courseVideoDir = courseVideoDir; }
    public String getUploadTempDir() { return uploadTempDir; }
    public void setUploadTempDir(String uploadTempDir) { this.uploadTempDir = uploadTempDir; }
    public String getOssEndpoint() { return ossEndpoint; }
    public void setOssEndpoint(String ossEndpoint) { this.ossEndpoint = ossEndpoint; }
    public String getOssBucket() { return ossBucket; }
    public void setOssBucket(String ossBucket) { this.ossBucket = ossBucket; }
    public String getOssAccessKeyId() { return ossAccessKeyId; }
    public void setOssAccessKeyId(String ossAccessKeyId) { this.ossAccessKeyId = ossAccessKeyId; }
    public String getOssAccessKeySecret() { return ossAccessKeySecret; }
    public void setOssAccessKeySecret(String ossAccessKeySecret) { this.ossAccessKeySecret = ossAccessKeySecret; }
    public String getOssPublicBaseUrl() { return ossPublicBaseUrl; }
    public void setOssPublicBaseUrl(String ossPublicBaseUrl) { this.ossPublicBaseUrl = ossPublicBaseUrl; }
    public String getQwenApiKey() { return qwenApiKey; }
    public void setQwenApiKey(String qwenApiKey) { this.qwenApiKey = qwenApiKey; }
    public String getQwenChatUrl() { return qwenChatUrl; }
    public void setQwenChatUrl(String qwenChatUrl) { this.qwenChatUrl = qwenChatUrl; }
    public String getQwenModel() { return qwenModel; }
    public void setQwenModel(String qwenModel) { this.qwenModel = qwenModel; }
    public String getQwenPromptVersion() { return qwenPromptVersion; }
    public void setQwenPromptVersion(String qwenPromptVersion) { this.qwenPromptVersion = qwenPromptVersion; }
    public String getAliyunOcrAccessKeyId() { return aliyunOcrAccessKeyId; }
    public void setAliyunOcrAccessKeyId(String aliyunOcrAccessKeyId) { this.aliyunOcrAccessKeyId = aliyunOcrAccessKeyId; }
    public String getAliyunOcrAccessKeySecret() { return aliyunOcrAccessKeySecret; }
    public void setAliyunOcrAccessKeySecret(String aliyunOcrAccessKeySecret) { this.aliyunOcrAccessKeySecret = aliyunOcrAccessKeySecret; }
    public String getAliyunOcrEndpoint() { return aliyunOcrEndpoint; }
    public void setAliyunOcrEndpoint(String aliyunOcrEndpoint) { this.aliyunOcrEndpoint = aliyunOcrEndpoint; }
    public String getAliyunOcrSubjectDefault() { return aliyunOcrSubjectDefault; }
    public void setAliyunOcrSubjectDefault(String aliyunOcrSubjectDefault) { this.aliyunOcrSubjectDefault = aliyunOcrSubjectDefault; }
    public String getAliyunOcrImageType() { return aliyunOcrImageType; }
    public void setAliyunOcrImageType(String aliyunOcrImageType) { this.aliyunOcrImageType = aliyunOcrImageType; }
    public String getAliyunOcrCutType() { return aliyunOcrCutType; }
    public void setAliyunOcrCutType(String aliyunOcrCutType) { this.aliyunOcrCutType = aliyunOcrCutType; }
    public Boolean getAliyunOcrOutputOriCoord() { return aliyunOcrOutputOriCoord; }
    public void setAliyunOcrOutputOriCoord(Boolean aliyunOcrOutputOriCoord) { this.aliyunOcrOutputOriCoord = aliyunOcrOutputOriCoord; }
    public String getPaperDir() { return paperDir; }
    public void setPaperDir(String paperDir) { this.paperDir = paperDir; }

    public String getDefaultPassword() { return defaultPassword; }
    public void setDefaultPassword(String defaultPassword) { this.defaultPassword = defaultPassword; }

    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }

    public Long getJwtExpiration() { return jwtExpiration; }
    public void setJwtExpiration(Long jwtExpiration) { this.jwtExpiration = jwtExpiration; }

    public String getWechatAppId() { return wechatAppId; }
    public void setWechatAppId(String wechatAppId) { this.wechatAppId = wechatAppId; }

    public String getWechatAppSecret() { return wechatAppSecret; }
    public void setWechatAppSecret(String wechatAppSecret) { this.wechatAppSecret = wechatAppSecret; }

    public String getUploadDir() { return uploadDir; }
    public void setUploadDir(String uploadDir) { this.uploadDir = uploadDir; }
}
