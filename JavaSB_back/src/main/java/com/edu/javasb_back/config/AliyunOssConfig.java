package com.edu.javasb_back.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 阿里云 OSS 客户端配置
 */
@Configuration
public class AliyunOssConfig {

    @Autowired
    private AliyunOssProperties aliyunOssProperties;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Bean(destroyMethod = "shutdown")
    public OSS ossClient() {
        String endpointHost = aliyunOssProperties.getEndpointHost();
        String finalEndpoint = endpointHost.startsWith("http://") || endpointHost.startsWith("https://")
                ? endpointHost
                : "https://" + endpointHost;
        return new OSSClientBuilder().build(
                finalEndpoint,
                globalConfigProperties.getOssAccessKeyId(),
                globalConfigProperties.getOssAccessKeySecret()
        );
    }
}
