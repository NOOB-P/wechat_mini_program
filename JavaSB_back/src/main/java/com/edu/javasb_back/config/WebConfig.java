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
        String paperDir = globalConfigProperties.getPaperDir();
        
        // 核心：处理路径，确保它是绝对路径
        registerResourceHandler(registry, "/uploads/code/**", uploadDir);
        registerResourceHandler(registry, "/uploads/papers/**", paperDir);
        
        // 保留原有的映射作为回退
        registerResourceHandler(registry, "/uploads/**", uploadDir);
    }

    private void registerResourceHandler(ResourceHandlerRegistry registry, String pattern, String dir) {
        File fileDir = new File(dir);
        if (!fileDir.exists()) {
            fileDir.mkdirs();
        }
        String absolutePath = fileDir.getAbsolutePath();
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        String filePath = "file:" + absolutePath;
        registry.addResourceHandler(pattern).addResourceLocations(filePath);
    }
}
