package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.utils.AuthCookieUtils;
import com.edu.javasb_back.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 后台管理端认证控制器
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private SysAccountService sysAccountService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthCookieUtils authCookieUtils;

    /**
     * 获取后台登录可选角色
     */
    @GetMapping("/roles")
    public Result<List<SysRole>> getLoginRoles() {
        return sysAccountService.getLoginRoles();
    }

    /**
     * 后台密码登录
     */
    @LogOperation("后台密码登录")
    @PostMapping("/login")
    public Result<LoginVO> adminLogin(
            @RequestBody AccountLoginDTO loginDTO,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        Result<LoginVO> result = sysAccountService.adminLogin(loginDTO);
        if (result != null && result.getCode() != null && result.getCode() == 200 && result.getData() != null) {
            LoginVO loginVO = result.getData();
            authCookieUtils.writeAuthCookies(
                    request,
                    response,
                    loginVO.getToken(),
                    jwtUtils.getAccessTokenExpiration(),
                    loginVO.getRefreshToken(),
                    jwtUtils.getRefreshTokenExpiration()
            );
        }
        return result;
    }
}
