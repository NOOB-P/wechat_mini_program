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

    // 手动添加 Getter 和 Setter 方法，以防 Lombok 失效
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
