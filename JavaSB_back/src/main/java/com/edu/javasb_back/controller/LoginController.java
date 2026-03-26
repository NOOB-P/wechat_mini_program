package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.LoginDTO;
import com.edu.javasb_back.model.dto.RegisterDTO;
import com.edu.javasb_back.model.entity.Parent;
import com.edu.javasb_back.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
// 移除这里的 @CrossOrigin，因为已经在 CorsConfig 中全局配置了，避免冲突
public class LoginController {

    @Autowired
    private ParentService parentService;

    @GetMapping("/test")
    public String test() {
        return "hello";
    }

    @PostMapping("/sendCode")
    public Result<String> sendCode(@RequestBody LoginDTO loginDTO) {
        return parentService.sendSmsCode(loginDTO.getPhone());
    }

    @PostMapping("/password")
    public Result<Parent> login(@RequestBody LoginDTO loginDTO) {
        return parentService.login(loginDTO);
    }

    @PostMapping("/register")
    public Result<Parent> register(@RequestBody RegisterDTO registerDTO) {
        return parentService.register(registerDTO);
    }
}
