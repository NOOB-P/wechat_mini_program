package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
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
    private SysStudentRepository studentRepository;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

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

        // 因为使用了 @JsonIgnore 注解，JackSon 在序列化的时候会自动忽略 password 字段。
        // 我们不需要，也不能在此时通过 account.setPassword(null) 去清空它，
        // 否则如果在 Open-In-View 模式下或者事务内，JPA 会在请求结束时自动将 null 更新到数据库！
        
        // 使用账号表中的冗余字段
        boolean isBoundStudent = account.getIsBoundStudent() != null && account.getIsBoundStudent() == 1;
        
        LoginVO loginVO = new LoginVO(token, refreshToken, account, isBoundStudent);
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

    @Override
    public Result<Void> updatePassword(Long uid, String oldPassword, String newPassword) {
        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            return Result.error("密码不能为空");
        }

        Optional<SysAccount> accountOpt = accountRepository.findById(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();

        // 验证旧密码
        boolean isMatch = false;
        if (account.getPassword() != null) {
            if (oldPassword.equals(account.getPassword())) {
                isMatch = true;
            } else if (passwordEncoder.matches(oldPassword, account.getPassword())) {
                isMatch = true;
            }
        } else {
            // 兼容之前可能被置空的密码，如果旧密码输入 123456 则放行
            if ("123456".equals(oldPassword)) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            return Result.error("当前密码不正确");
        }

        // 设置新密码
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        return Result.success("密码修改成功", null);
    }

    @Override
    @Transactional
    public Result<Void> bindStudent(Long uid, String studentName, String studentNo) {
        if (!StringUtils.hasText(studentName) || !StringUtils.hasText(studentNo)) {
            return Result.error("学生姓名和学号不能为空");
        }

        // 1. 验证学生是否存在
        Optional<SysStudent> studentOpt = studentRepository.findByStudentNo(studentNo);
        if (studentOpt.isEmpty()) {
            return Result.error("学生学号不存在，请检查后重新输入");
        }

        SysStudent student = studentOpt.get();
        if (!student.getName().equals(studentName)) {
            return Result.error("学生姓名与学号不匹配");
        }

        // 2. 检查家长是否已经绑定过学生 (一个家长只能绑定一个学生)
        List<StudentParentBinding> parentBindings = bindingRepository.findByParentUid(uid);
        if (!parentBindings.isEmpty()) {
            return Result.error("您的账号已绑定过学生，一个账号只能绑定一名学生");
        }

        // 3. 检查绑定上限 (一个学生最多5个家长)
        long boundCount = bindingRepository.countByStudentId(student.getId());
        if (boundCount >= 5) {
            return Result.error("该学生绑定的家长数量已达上限(5人)");
        }

        // 4. 创建绑定关系
        StudentParentBinding binding = new StudentParentBinding();
        binding.setStudentId(student.getId());
        binding.setParentUid(uid);
        binding.setBindingType("parent");
        bindingRepository.save(binding);

        // 5. 更新学生表中的绑定数量冗余字段
        student.setBoundCount((int) (boundCount + 1));
        studentRepository.save(student);

        // 6. 更新账号表中的绑定状态冗余字段
        Optional<SysAccount> parentOpt = accountRepository.findById(uid);
        if (parentOpt.isPresent()) {
            SysAccount parent = parentOpt.get();
            parent.setIsBoundStudent(1);
            accountRepository.save(parent);
        }

        return Result.success("绑定成功", null);
    }

    @Override
    @Transactional
    public Result<Void> bindStudentById(Long uid, String studentId) {
        if (!StringUtils.hasText(studentId)) {
            return Result.error("学生ID不能为空");
        }

        // 1. 验证学生是否存在
        Optional<SysStudent> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return Result.error("学生不存在");
        }

        SysStudent student = studentOpt.get();

        // 2. 检查家长是否已经绑定过学生 (一个家长只能绑定一个学生)
        List<StudentParentBinding> parentBindings = bindingRepository.findByParentUid(uid);
        if (!parentBindings.isEmpty()) {
            // 如果已经绑定了当前学生，直接返回成功
            if (parentBindings.get(0).getStudentId().equals(studentId)) {
                return Result.success("已绑定该学生", null);
            }
            return Result.error("您的账号已绑定过学生，一个账号只能绑定一名学生");
        }

        // 3. 检查学生绑定上限
        long boundCount = bindingRepository.countByStudentId(studentId);
        if (boundCount >= 5) {
            return Result.error("该学生绑定的家长数量已达上限(5人)");
        }

        // 4. 创建绑定
        StudentParentBinding binding = new StudentParentBinding();
        binding.setStudentId(studentId);
        binding.setParentUid(uid);
        bindingRepository.save(binding);

        // 5. 更新冗余字段
        student.setBoundCount((int) (boundCount + 1));
        studentRepository.save(student);

        Optional<SysAccount> parentOpt = accountRepository.findById(uid);
        if (parentOpt.isPresent()) {
            SysAccount parent = parentOpt.get();
            parent.setIsBoundStudent(1);
            accountRepository.save(parent);
        }

        return Result.success("绑定成功", null);
    }

    @Override
    @Transactional
    public Result<Void> unbindStudentByParentUid(Long uid) {
        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) {
            return Result.success("未绑定学生，无需解绑", null);
        }

        for (StudentParentBinding binding : bindings) {
            // 1. 更新学生的绑定数
            Optional<SysStudent> studentOpt = studentRepository.findById(binding.getStudentId());
            if (studentOpt.isPresent()) {
                SysStudent student = studentOpt.get();
                if (student.getBoundCount() > 0) {
                    student.setBoundCount(student.getBoundCount() - 1);
                    studentRepository.save(student);
                }
            }
            // 2. 删除绑定记录
            bindingRepository.delete(binding);
        }

        // 3. 更新账号标志
        Optional<SysAccount> parentOpt = accountRepository.findById(uid);
        if (parentOpt.isPresent()) {
            SysAccount parent = parentOpt.get();
            parent.setIsBoundStudent(0);
            accountRepository.save(parent);
        }

        return Result.success("解绑成功", null);
    }
}
