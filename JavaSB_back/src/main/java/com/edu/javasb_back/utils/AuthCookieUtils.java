package com.edu.javasb_back.utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AuthCookieUtils {

    public static final String ACCESS_TOKEN_COOKIE = "admin_access_token";
    public static final String REFRESH_TOKEN_COOKIE = "admin_refresh_token";

    public void writeAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response,
            String accessToken,
            long accessTokenTtlMillis,
            String refreshToken,
            long refreshTokenTtlMillis
    ) {
        boolean secure = isSecureRequest(request);
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenTtlMillis, secure));
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenTtlMillis, secure));
    }

    public void clearAuthCookies(HttpServletRequest request, HttpServletResponse response) {
        boolean secure = isSecureRequest(request);
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(ACCESS_TOKEN_COOKIE, secure));
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(REFRESH_TOKEN_COOKIE, secure));
    }

    public String resolveAccessToken(HttpServletRequest request) {
        return readCookie(request, ACCESS_TOKEN_COOKIE);
    }

    public String resolveRefreshToken(HttpServletRequest request) {
        return readCookie(request, REFRESH_TOKEN_COOKIE);
    }

    private String readCookie(HttpServletRequest request, String cookieName) {
        if (request == null || !StringUtils.hasText(cookieName) || request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookie != null && cookieName.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return cookie.getValue().trim();
            }
        }
        return null;
    }

    private String buildCookie(String name, String value, long ttlMillis, boolean secure) {
        long maxAgeSeconds = Math.max(ttlMillis / 1000, 0);
        return ResponseCookie.from(name, value == null ? "" : value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build()
                .toString();
    }

    private String clearCookie(String name, boolean secure) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build()
                .toString();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        if (request == null) {
            return false;
        }
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (StringUtils.hasText(forwardedProto)) {
            return "https".equalsIgnoreCase(forwardedProto.trim());
        }
        return request.isSecure();
    }
}
