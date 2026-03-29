package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 为了保持接口整洁，原 AuthController 拆分为 AdminAuthController 和 AppAuthController。
 * 此类暂时保留作为基础/通用接口，或者可以直接删除。
 * 目前将通用的登出、获取用户信息保留在这里，或者可以分别移入对应的 Controller。
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
