package com.edu.javasb_back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults()) // 启用CORS并使用默认配置（读取CorsConfig的配置）
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // 放在最前面：放行所有 OPTIONS 预检请求
                .requestMatchers("/api/auth/**").permitAll() // 通用认证接口
                .requestMatchers("/api/admin/auth/**").permitAll() // 后台管理端登录
                .requestMatchers("/api/vip/options").permitAll() // 放行小程序获取会员配置
                .requestMatchers("/api/app/auth/**").permitAll() // 小程序端登录、验证码
                .requestMatchers("/api/log/**").permitAll() // 临时放行日志接口
                .requestMatchers("/api/admin/payment/**").permitAll() // 后台管理端支付配置接口
                .requestMatchers("/api/admin/order/**").permitAll()   // 后台管理端订单管理接口
                .requestMatchers("/api/app/vip/**").permitAll() // 小程序端 VIP 相关接口
                .requestMatchers("/api/students/**").permitAll() // 临时放行学生管理接口
                .requestMatchers("/api/system/school/**").permitAll() // 临时放行学校管理接口
                .requestMatchers("/api/system/class/**").permitAll() // 临时放行班级管理接口
                .requestMatchers("/api/admin/resource/paper/**").permitAll() // 放行试卷管理接口
                .requestMatchers("/api/app/resource/paper/**").permitAll() // 放行小程序试卷资源接口
                .requestMatchers("/api/app/course/**").permitAll() // 放行小程序课程相关接口
                .requestMatchers("/uploads/**").permitAll() // 放行上传的静态资源图片
                

                .anyRequest().authenticated() // 其他所有请求都需要携带有效 Token
            )
            // 将 JWT 过滤器添加到 UsernamePasswordAuthenticationFilter 之前
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
