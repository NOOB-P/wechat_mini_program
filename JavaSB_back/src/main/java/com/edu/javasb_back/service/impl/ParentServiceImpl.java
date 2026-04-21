package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.LoginDTO;
import com.edu.javasb_back.model.dto.RegisterDTO;
import com.edu.javasb_back.model.entity.Parent;
import com.edu.javasb_back.repository.ParentRepository;
import com.edu.javasb_back.service.ParentService;
import com.edu.javasb_back.service.SmsService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentServiceImpl implements ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private SmsService smsService;

    @Override
    public Result<String> sendSmsCode(String phone) {
        if (!isValidPhone(phone)) {
            return Result.error("手机号格式不正确");
        }
        try {
            smsService.sendVerificationCode(phone);
            return Result.success("验证码已发送", null);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("短信发送失败，请稍后重试");
        }
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
        parent.setPassword(null);
        return Result.success("登录成功", parent);
    }

    @Override
    public Result<Parent> register(RegisterDTO registerDTO) {
        if (!smsService.verifyCode(registerDTO.getPhone(), registerDTO.getCode())) {
            return Result.error("验证码错误或已过期");
        }

        if (parentRepository.existsByPhone(registerDTO.getPhone())) {
            return Result.error("手机号已注册");
        }

        Parent parent = new Parent();
        parent.setPhone(registerDTO.getPhone());
        parent.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        if (StringUtils.hasText(registerDTO.getNickname())) {
            parent.setNickname(registerDTO.getNickname());
        }

        parentRepository.save(parent);
        smsService.removeVerificationCode(registerDTO.getPhone());

        parent.setPassword(null);
        return Result.success("注册成功", parent);
    }

    private boolean isValidPhone(String phone) {
        return StringUtils.hasText(phone) && phone.matches("^1[3-9]\\d{9}$");
    }
}
