package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.LoginDTO;
import com.edu.javasb_back.model.dto.RegisterDTO;
import com.edu.javasb_back.model.entity.Parent;

public interface ParentService {
    Result<Parent> login(LoginDTO loginDTO);
    Result<Parent> register(RegisterDTO registerDTO);
    Result<String> sendSmsCode(String phone);
}
