package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台管理端认证控制器
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private SysAccountService sysAccountService;

    /**
     * 后台密码登录
     */
    @LogOperation("后台密码登录")
    @PostMapping("/login")
    public Result<LoginVO> adminLogin(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.adminLogin(loginDTO);
    }
}
