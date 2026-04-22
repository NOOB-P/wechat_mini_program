package com.edu.javasb_back.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 阿里云 OSS 客户端配置
 */
@Configuration
public class AliyunOssConfig {

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;

    @Value("${app.config.oss-access-key-id}")
    private String accessKeyId;

    @Value("${app.config.oss-access-key-secret}")
    private String accessKeySecret;

    @Bean(destroyMethod = "shutdown")
    public OSS ossClient() {
        String finalEndpoint = endpoint;
        if (finalEndpoint != null
                && !finalEndpoint.startsWith("http://")
                && !finalEndpoint.startsWith("https://")) {
            finalEndpoint = "https://" + finalEndpoint;
        }
        return new OSSClientBuilder().build(finalEndpoint, accessKeyId, accessKeySecret);
    }
}
