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
        String uploadRootDir = resolveUploadRootDir(uploadDir);
        String coverDir = globalConfigProperties.getCourseCoverDir();
        String videoDir = globalConfigProperties.getCourseVideoDir();

        registerResourceHandler(registry, "/uploads/code/**", uploadDir);
        registerResourceHandler(registry, "/uploads/course/cover/**", coverDir);
        registerResourceHandler(registry, "/uploads/course/video/**", videoDir);

        registerResourceHandler(registry, "/static/uploads/course/cover/**", coverDir);
        registerResourceHandler(registry, "/static/uploads/course/video/**", videoDir);

        registerResourceHandler(registry, "/uploads/**", uploadRootDir, uploadDir, coverDir, videoDir);
        registerResourceHandler(registry, "/static/uploads/**", uploadRootDir, uploadDir, coverDir, videoDir);

        // 将 /static/** 映射到 classpath 下的 static 目录
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
