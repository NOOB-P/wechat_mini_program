package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.dto.PasswordUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 认证及当前用户通用接口
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private SysAccountService sysAccountService;

    /**
     * 获取当前登录用户信息（无需传UID，根据Token解析）
     */
    @LogOperation("获取当前用户信息")
    @GetMapping("/info")
    public Result<SysAccount> getCurrentUserInfo() {
        // 从 SecurityContext 获取用户名
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || "anonymousUser".equals(username)) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.getUserInfoByUsername(username);
    }

    /**
     * 获取指定用户信息 (备用)
     */
    @LogOperation("获取指定用户信息")
    @GetMapping("/userInfo/{uid}")
    public Result<SysAccount> getUserInfo(@PathVariable Long uid) {
        return sysAccountService.getUserInfo(uid);
    }

    /**
     * 更新当前用户基本信息
     */
    @LogOperation("修改用户基本信息")
    @PutMapping("/userInfo/{uid}")
    public Result<Void> updateBasicInfo(@PathVariable Long uid, @RequestBody AccountUpdateDTO updateDTO) {
        return sysAccountService.updateBasicInfo(uid, updateDTO);
    }

    /**
     * 修改密码
     */
    @LogOperation("修改密码")
    @PutMapping("/password")
    public Result<Void> updatePassword(@RequestBody PasswordUpdateDTO updateDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || "anonymousUser".equals(username)) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.updatePassword(username, updateDTO.getOldPassword(), updateDTO.getNewPassword());
    }

    /**
     * 退出登录
     */
    @LogOperation("退出登录")
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        return sysAccountService.logout(token);
    }
}
