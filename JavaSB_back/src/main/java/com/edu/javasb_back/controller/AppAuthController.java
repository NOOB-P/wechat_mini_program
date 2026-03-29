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
 * 小程序端认证控制器
 */
@RestController
@RequestMapping("/api/app/auth")
public class AppAuthController {

    @Autowired
    private SysAccountService sysAccountService;

    /**
     * 发送短信验证码 (小程序端使用)
     */
    @LogOperation("发送短信验证码")
    @PostMapping("/sendCode")
    public Result<String> sendCode(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.sendSmsCode(loginDTO.getPhone());
    }

    /**
     * 手机号密码登录 (小程序家长端)
     */
    @LogOperation("小程序密码登录")
    @PostMapping("/login/password")
    public Result<LoginVO> appLoginByPassword(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.appLoginByPassword(loginDTO);
    }

    /**
     * 手机验证码登录 (小程序端使用，自动注册)
     */
    @LogOperation("小程序验证码登录")
    @PostMapping("/login/phone")
    public Result<LoginVO> loginByPhone(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.loginByPhone(loginDTO);
    }
}
