package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.service.SysAccountService;
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
    public Result<LoginVO> adminLogin(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.adminLogin(loginDTO);
    }
}
