package com.edu.javasb_back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许所有路径
                // 允许 Vue 项目的地址，可以根据需要添加更多地址，例如微信开发者工具的地址
                .allowedOrigins(
                        "http://localhost:8080",
                        "http://localhost:5173", // Vite 默认端口
                        "http://127.0.0.1:5173",
                        "http://localhost:3000"  // 备用端口
                )
                // 移除 allowedOriginPatterns("*")，避免和 allowCredentials(true) 一起使用时在部分版本 Spring Boot 中出现冲突
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
