package com.edu.javasb_back.config;

import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private RolePermissionService rolePermissionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        Long uid = null;
        String jwt = null;

        // 尝试从请求头或请求参数中获取 token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.replace("Bearer ", "").trim();
            
            // 鲁棒性处理：如果前端传了 Bearer Bearer <token>
            if (jwt.startsWith("Bearer ")) {
                jwt = jwt.replace("Bearer ", "").trim();
            }
        } else {
            // 如果请求头没有，尝试从查询参数获取
            jwt = request.getParameter("token");
        }

        if (jwt != null && !jwt.isEmpty()) {
            // 检查 Token 是否在黑名单中 (已退出登录)
            // 增加 try-catch 块，如果 Redis 连接失败，不要阻断正常的 Token 验证
            Boolean isBlacklisted = false;
            try {
                isBlacklisted = stringRedisTemplate.hasKey("jwt_blacklist:" + jwt);
            } catch (Exception e) {
                logger.error("Redis check failed: " + e.getMessage());
                // 如果 Redis 挂了，暂时允许放行，或者你可以决定在这里返回 401
            }

            if (Boolean.TRUE.equals(isBlacklisted)) {
                logger.warn("JWT 在黑名单中，已被注销");
                // 可以直接返回 401，也可以放行让后面的 Security 拦截器处理
                filterChain.doFilter(request, response);
                return;
            }

            try {
                uid = jwtUtils.extractUid(jwt);
            } catch (Exception e) {
                // Token 无效或过期，记录日志或忽略
                logger.warn("JWT 验证失败: " + e.getMessage());
            }
        }

        // 如果成功解析出用户ID，且 SecurityContext 中还没有认证信息
        if (uid != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 验证 Token 是否有效
            if (jwtUtils.validateToken(jwt)) {
                // 如果有效，构建一个 UsernamePasswordAuthenticationToken
                // 这里的 principal 存入 uid 的字符串形式
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                sysAccountRepository.findById(uid).ifPresent(account -> {
                    rolePermissionService.getPermissionCodesByRoleId(account.getRoleId()).stream()
                            .map(SimpleGrantedAuthority::new)
                            .forEach(authorities::add);
                    sysRoleRepository.findById(account.getRoleId())
                            .map(role -> "ROLE_" + role.getRoleCode().toUpperCase())
                            .map(SimpleGrantedAuthority::new)
                            .ifPresent(authorities::add);
                });
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        uid.toString(), null, authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 将认证信息放入 Security 上下文，这样后续就可以被认定为已登录状态
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
}
