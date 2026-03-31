package com.edu.javasb_back.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 将 /uploads/** 映射到本地磁盘路径
        String uploadDir = globalConfigProperties.getUploadDir();
        
        // 核心：处理路径，确保它是绝对路径
        File fileDir = new File(uploadDir);
        String absolutePath = fileDir.getAbsolutePath();
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        
        // 转换为 Spring 要求的 file: 协议格式
        String filePath = "file:" + absolutePath;
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(filePath);
    }
}
