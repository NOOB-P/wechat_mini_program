package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
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
     * 获取当前用户信息
     */
    @LogOperation("获取当前用户信息")
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
