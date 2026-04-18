package com.edu.javasb_back.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edu.javasb_back.common.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers("/static/**")
            .requestMatchers("/uploads/**")
            .requestMatchers("/favicon.ico");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // 启用CORS并使用默认配置
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // 放行所有 OPTIONS 预检请求
                .requestMatchers("/api/auth/**").permitAll() // 通用认证接口
                .requestMatchers("/api/admin/auth/**").permitAll() // 后台管理端登录
                .requestMatchers("/api/vip/options").permitAll() // 放行小程序获取会员配置
                .requestMatchers("/api/app/auth/**").permitAll() // 小程序端登录、验证码
                .requestMatchers("/api/log/**").permitAll() // 日志接口
                .requestMatchers("/api/admin/payment/**").permitAll() // 后台管理端支付配置接口
                .requestMatchers("/api/admin/order/**").permitAll()   // 后台管理端订单管理接口
                .requestMatchers("/api/app/vip/**").permitAll() // 小程序端 VIP 相关接口
                .requestMatchers("/api/students/**").permitAll() // 学生管理接口
                .requestMatchers("/api/system/school/**").permitAll() // 学校管理接口
                .requestMatchers("/api/system/class/**").permitAll() // 班级管理接口
                .requestMatchers("/api/system/exam-project/**").permitAll() // 考试项目相关接口
                .requestMatchers("/api/admin/resource/paper/**").permitAll() // 放行试卷管理接口
                .requestMatchers("/api/app/resource/paper/**").permitAll() // 放行小程序试卷资源接口
                .requestMatchers("/api/app/course/**").permitAll() // 放行小程序课程相关接口
                .requestMatchers("/api/app/mine/**").permitAll() // 放行小程序个人中心相关接口
                .requestMatchers("/api/app/order/print/**").permitAll() // 放行小程序打印订单接口
                .requestMatchers("/api/customer/**").permitAll() // 客服相关接口
                .requestMatchers("/error").permitAll() // 错误页面
                .requestMatchers("/uploads/**").permitAll() // 放行上传的动态图片
                .requestMatchers("/static/**").permitAll() // 放行固定静态资源
                
                .anyRequest().authenticated() // 其他所有请求都需要携带有效 Token
            )
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint((request, response, ex) -> writeJson(response, 401, "未登录或登录已过期"))
                .accessDeniedHandler((request, response, ex) -> writeJson(response, 403, "无权限执行此操作"))
            )
            // 将 JWT 过滤器添加到 UsernamePasswordAuthenticationFilter 之前
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private void writeJson(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(Result.error(status, message)));
    }
}
