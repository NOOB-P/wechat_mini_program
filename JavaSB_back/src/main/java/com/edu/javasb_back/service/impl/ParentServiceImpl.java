package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.LoginDTO;
import com.edu.javasb_back.model.dto.RegisterDTO;
import com.edu.javasb_back.model.entity.Parent;
import com.edu.javasb_back.repository.ParentRepository;
import com.edu.javasb_back.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ParentServiceImpl implements ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // 模拟验证码存储，实际开发应使用 Redis
    private static final ConcurrentHashMap<String, String> smsCodeMap = new ConcurrentHashMap<>();

    @Override
    public Result<String> sendSmsCode(String phone) {
        // 生成 6 位随机验证码
        String code = String.format("%06d", new Random().nextInt(1000000));
        smsCodeMap.put(phone, code);
        System.out.println("手机号: " + phone + " 的验证码是: " + code);
        return Result.success("验证码已发送", code);
    }

    @Override
    public Result<Parent> login(LoginDTO loginDTO) {
        Optional<Parent> parentOptional = parentRepository.findByPhone(loginDTO.getPhone());
        if (parentOptional.isEmpty()) {
            return Result.error("手机号不存在");
        }
        
        Parent parent = parentOptional.get();
        if (parent.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }
        
        if (!passwordEncoder.matches(loginDTO.getPassword(), parent.getPassword())) {
            return Result.error("密码错误");
        }
        
        parent.setLastLogin(LocalDateTime.now());
        parentRepository.save(parent);
        
        // 为了安全，清空返回结果中的密码
        parent.setPassword(null);
        return Result.success("登录成功", parent);
    }

    @Override
    public Result<Parent> register(RegisterDTO registerDTO) {
        // 校验验证码
        String cachedCode = smsCodeMap.get(registerDTO.getPhone());
        if (cachedCode == null || !cachedCode.equals(registerDTO.getCode())) {
            return Result.error("验证码错误或已过期");
        }

        if (parentRepository.existsByPhone(registerDTO.getPhone())) {
            return Result.error("手机号已注册");
        }
        
        Parent parent = new Parent();
        parent.setPhone(registerDTO.getPhone());
        parent.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        if (registerDTO.getNickname() != null && !registerDTO.getNickname().isEmpty()) {
            parent.setNickname(registerDTO.getNickname());
        }
        
        parentRepository.save(parent);
        
        // 注册成功后移除验证码
        smsCodeMap.remove(registerDTO.getPhone());
        
        parent.setPassword(null);
        return Result.success("注册成功", parent);
    }
}
