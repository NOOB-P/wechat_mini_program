package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class SysAccountServiceImpl implements SysAccountService {

    @Autowired
    private SysAccountRepository accountRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    // 模拟验证码缓存
    private static final ConcurrentHashMap<String, String> smsCodeMap = new ConcurrentHashMap<>();

    @Override
    public Result<String> sendSmsCode(String phone) {
        if (!StringUtils.hasText(phone) || phone.length() != 11) {
            return Result.error("手机号格式不正确");
        }
        String code = String.format("%06d", new Random().nextInt(1000000));
        smsCodeMap.put(phone, code);
        System.out.println("【模拟短信】手机号: " + phone + "，验证码: " + code);
        return Result.success("验证码已发送", code);
    }

    @Override
    public Result<LoginVO> adminLogin(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getUsername())) {
            return Result.error("账号不能为空");
        }
        if (!StringUtils.hasText(loginDTO.getPassword())) {
            return Result.error("密码不能为空");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByUsername(loginDTO.getUsername());

        // 强制区分大小写匹配（因为 MySQL 的 utf8mb4_general_ci 默认是不区分大小写的）
        if (accountOpt.isEmpty() || !accountOpt.get().getUsername().equals(loginDTO.getUsername())) {
            return Result.error("账号或密码错误"); 
        }

        SysAccount account = accountOpt.get();

        if (account.getRoleId() == null || (account.getRoleId() != 1 && account.getRoleId() != 2)) {
            return Result.error("该账号没有后台登录权限");
        }

        if (account.getIsEnabled() == 0 || "banned".equals(account.getOnlineStatus())) {
            return Result.error("账号已被禁用或封禁");
        }

        String password = loginDTO.getPassword();
        boolean isMatch = false;
        
        if (account.getPassword() != null) {
            if (password.equals(account.getPassword())) {
                isMatch = true;
                account.setPassword(passwordEncoder.encode(password));
                accountRepository.save(account);
            } else if (passwordEncoder.matches(password, account.getPassword())) {
                isMatch = true;
            }
        } else {
            // 之前因为 Open-In-View 导致密码被清空，这里做个自动恢复修复
            if ("123456".equals(password)) {
                isMatch = true;
                account.setPassword(passwordEncoder.encode("123456"));
                accountRepository.save(account);
            }
        }

        if (!isMatch) {
            return Result.error("账号或密码错误");
        }

        return generateLoginResult(account);
    }

    @Override
    public Result<LoginVO> appLoginByPassword(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getPhone())) {
            return Result.error("手机号不能为空");
        }
        if (!StringUtils.hasText(loginDTO.getPassword())) {
            return Result.error("密码不能为空");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByPhone(loginDTO.getPhone());
        
        if (accountOpt.isEmpty()) {
            return Result.error("该手机号未注册");
        }

        SysAccount account = accountOpt.get();

        if (account.getIsEnabled() == 0 || "banned".equals(account.getOnlineStatus())) {
            return Result.error("账号已被禁用或封禁");
        }

        String password = loginDTO.getPassword();
        boolean isMatch = false;
        if (account.getPassword() != null) {
            if (password.equals(account.getPassword())) {
                isMatch = true;
                account.setPassword(passwordEncoder.encode(password));
                accountRepository.save(account);
            } else if (passwordEncoder.matches(password, account.getPassword())) {
                isMatch = true;
            }
        } else {
            if ("123456".equals(password)) {
                isMatch = true;
                account.setPassword(passwordEncoder.encode("123456"));
                accountRepository.save(account);
            }
        }

        if (!isMatch) {
            return Result.error("手机号或密码错误");
        }

        return generateLoginResult(account);
    }

    @Override
    public Result<LoginVO> loginByPhone(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getPhone()) || !StringUtils.hasText(loginDTO.getCode())) {
            return Result.error("手机号和验证码不能为空");
        }

        String cachedCode = smsCodeMap.get(loginDTO.getPhone());
        if (cachedCode == null || !cachedCode.equals(loginDTO.getCode())) {
            return Result.error("验证码错误或已过期");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByPhone(loginDTO.getPhone());
        SysAccount account;
        if (accountOpt.isEmpty()) {
            // 如果家长不存在，则自动注册
            account = new SysAccount();
            account.setPhone(loginDTO.getPhone());
            // 设置默认密码
            account.setPassword(passwordEncoder.encode(globalConfigProperties.getDefaultPassword()));
            account.setNickname("家长_" + loginDTO.getPhone().substring(7));
            account.setRoleId(3); // 假设 3 是家长角色
            account.setIsEnabled(1);
            account.setOnlineStatus("online");
            accountRepository.save(account);
        } else {
            account = accountOpt.get();
            if (account.getIsEnabled() == 0 || "banned".equals(account.getOnlineStatus())) {
                return Result.error("账号已被禁用或封禁");
            }
        }

        // 验证通过，清除验证码
        smsCodeMap.remove(loginDTO.getPhone());

        return generateLoginResult(account);
    }

    @Override
    public Result<SysAccount> getUserInfo(Long uid) {
        Optional<SysAccount> accountOpt = accountRepository.findById(uid);
        if (accountOpt.isPresent()) {
            SysAccount account = accountOpt.get();
            return Result.success("获取成功", account);
        }
        return Result.error("用户不存在");
    }

    @Override
    public Result<SysAccount> getUserInfoByUsername(String username) {
        Optional<SysAccount> accountOpt = accountRepository.findByUsername(username);
        if (accountOpt.isPresent()) {
            SysAccount account = accountOpt.get();
            return Result.success("获取成功", account);
        }
        return Result.error("用户不存在");
    }

    private Result<LoginVO> generateLoginResult(SysAccount account) {
        // 更新最后登录时间和状态
        account.setLastLoginTime(LocalDateTime.now());
        account.setOnlineStatus("online");
        accountRepository.save(account);

        // 生成真实 JWT Token
        String token = "Bearer " + jwtUtils.generateToken(account.getUid(), account.getUsername(), account.getRoleId());
        String refreshToken = jwtUtils.generateRefreshToken(account.getUid(), account.getUsername());

        LoginVO loginVO = new LoginVO(token, refreshToken, account);
        return Result.success("登录成功", loginVO);
    }

    @Override
    public Result<Void> logout(String token) {
        if (StringUtils.hasText(token)) {
            // 将 Token 加入 Redis 黑名单，增加容错
            try {
                stringRedisTemplate.opsForValue().set("jwt_blacklist:" + token, "logout", 7, TimeUnit.DAYS);
            } catch (Exception e) {
                System.err.println("Failed to write token to Redis blacklist: " + e.getMessage());
            }
        }
        return Result.success("退出成功", null);
    }

    @Override
    public Result<Void> updateBasicInfo(Long uid, com.edu.javasb_back.model.dto.AccountUpdateDTO updateDTO) {
        Optional<SysAccount> accountOpt = accountRepository.findById(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }
        SysAccount account = accountOpt.get();
        
        // 如果提供了新数据，则更新
        if (StringUtils.hasText(updateDTO.getNickname())) {
            account.setNickname(updateDTO.getNickname());
        }
        if (StringUtils.hasText(updateDTO.getPhone())) {
            // 简单查重：如果手机号被别人占用了
            Optional<SysAccount> existPhone = accountRepository.findByPhone(updateDTO.getPhone());
            if (existPhone.isPresent() && !existPhone.get().getUid().equals(uid)) {
                return Result.error("该手机号已被其他账号绑定");
            }
            account.setPhone(updateDTO.getPhone());
        }
        if (StringUtils.hasText(updateDTO.getEmail())) {
            account.setEmail(updateDTO.getEmail());
        }
        
        accountRepository.save(account);
        return Result.success("修改成功", null);
    }
}
