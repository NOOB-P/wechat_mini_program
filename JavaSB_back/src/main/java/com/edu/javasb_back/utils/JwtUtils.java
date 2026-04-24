package com.edu.javasb_back.utils;

import com.edu.javasb_back.config.GlobalConfigProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    /**
     * 获取签名密钥
     */
    private Key getSigningKey() {
        String secret = globalConfigProperties.getJwtSecret();
        // 如果密钥长度不足，可能会报错，建议使用足够长的随机字符串作为密钥
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 Token
     * @param uid 用户ID
     * @param username 用户名
     * @param roleId 角色ID
     * @return Token 字符串
     */
    public String generateToken(Long uid, String username, Integer roleId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", uid);
        claims.put("username", username);
        claims.put("roleId", roleId);

        return createToken(claims, username, globalConfigProperties.getJwtExpiration());
    }

    /**
     * 生成 Refresh Token (过期时间比普通Token长)
     */
    public String generateRefreshToken(Long uid, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", uid);
        claims.put("username", username);
        // Refresh token 有效期设为普通的 7 倍 (例如普通一天，refresh 就是七天)
        long refreshExpiration = getRefreshTokenExpiration();
        return createToken(claims, username, refreshExpiration);
    }

    public long getAccessTokenExpiration() {
        return globalConfigProperties.getJwtExpiration();
    }

    public long getRefreshTokenExpiration() {
        return globalConfigProperties.getJwtExpiration() * 7;
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 从 Token 中获取所有的 Claims
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 从 Token 中获取用户名
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * 从 Token 中获取用户 UID
     */
    public Long extractUid(String token) {
        Claims claims = extractAllClaims(token);
        // jwt 中的数字默认可能是 Integer, 需要转成 Long
        return claims.get("uid", Long.class);
    }

    /**
     * 验证 Token 是否过期
     */
    public Boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * 验证 Token 的有效性
     */
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
