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
@CrossOrigin
public class LoginController {

    @Autowired
    private ParentService parentService;

    @PostMapping("/sendCode")
    @CrossOrigin
    public Result<String> sendCode(@RequestBody LoginDTO loginDTO) {
        return parentService.sendSmsCode(loginDTO.getPhone());
    }

    @PostMapping("/password")
    @CrossOrigin
    public Result<Parent> login(@RequestBody LoginDTO loginDTO) {
        return parentService.login(loginDTO);
    }

    @PostMapping("/register")
    @CrossOrigin
    public Result<Parent> register(@RequestBody RegisterDTO registerDTO) {
        return parentService.register(registerDTO);
    }
}
