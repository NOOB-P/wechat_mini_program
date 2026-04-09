package com.edu.javasb_back.config;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 将 /uploads/** 映射到本地磁盘路径
        String uploadDir = globalConfigProperties.getUploadDir();
        String paperDir = globalConfigProperties.getPaperDir();
        String uploadRootDir = resolveUploadRootDir(uploadDir);
        
        // 核心：处理路径，确保它是绝对路径
        registerResourceHandler(registry, "/uploads/code/**", uploadDir);
        registerResourceHandler(registry, "/uploads/papers/**", paperDir);
        
        // 兼容老路径 /uploads/xxx 和当前 code/papers 子目录路径
        registerResourceHandler(registry, "/uploads/**", uploadRootDir, uploadDir, paperDir);

        // 新增：将 /static/** 映射到 classpath 下的 static 目录
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }

    private String resolveUploadRootDir(String dir) {
        File fileDir = new File(dir);
        File parentDir = fileDir.getParentFile();
        if (parentDir != null) {
            return parentDir.getPath();
        }
        return fileDir.getPath();
    }

    private void registerResourceHandler(ResourceHandlerRegistry registry, String pattern, String... dirs) {
        List<String> locations = new ArrayList<>();
        for (String dir : dirs) {
            if (dir == null || dir.isBlank()) {
                continue;
            }
            File fileDir = new File(dir);
            if (!fileDir.exists()) {
                fileDir.mkdirs();
            }
            String absolutePath = fileDir.getAbsolutePath();
            if (!absolutePath.endsWith(File.separator)) {
                absolutePath += File.separator;
            }
            locations.add("file:" + absolutePath);
        }
        if (!locations.isEmpty()) {
            registry.addResourceHandler(pattern).addResourceLocations(locations.toArray(new String[0]));
        }
    }
}
