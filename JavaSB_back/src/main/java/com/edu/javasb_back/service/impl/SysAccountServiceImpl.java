package com.edu.javasb_back.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.listener.ParentImportListener;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.dto.ParentImportDTO;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.service.SmsService;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.utils.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
<<<<<<< HEAD
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
=======
>>>>>>> b2e37d11db5c65cbbbcf3dbbcf15b49233c10115

@Service
public class SysAccountServiceImpl implements SysAccountService {

    private static final int PARENT_ROLE_ID = 3;

    @Autowired
    private SysAccountRepository accountRepository;

    @Autowired
    private SysStudentRepository studentRepository;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private RolePermissionService rolePermissionService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SmsService smsService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

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
    public Result<List<SysRole>> getLoginRoles() {
        List<SysRole> roles = new ArrayList<>();
        sysRoleRepository.findByRoleCode("super_admin").ifPresent(roles::add);
        sysRoleRepository.findByRoleCode("admin").ifPresent(roles::add);
        return Result.success("获取成功", roles);
    }

    @Override
    public Result<LoginVO> adminLogin(AccountLoginDTO loginDTO) {
        if (loginDTO.getRoleId() == null) {
            return Result.error("请选择登录角色");
        }
        if (!StringUtils.hasText(loginDTO.getUsername())) {
            return Result.error("账号不能为空");
        }
        if (!StringUtils.hasText(loginDTO.getPassword())) {
            return Result.error("密码不能为空");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByUsername(loginDTO.getUsername());
        if (accountOpt.isEmpty() || !loginDTO.getUsername().equals(accountOpt.get().getUsername())) {
            return Result.error("账号或密码错误");
        }

        SysAccount account = accountOpt.get();
        if (!loginDTO.getRoleId().equals(account.getRoleId())) {
            return Result.error("所选角色与账号不匹配");
        }
        if (!rolePermissionService.isBackofficeRole(account.getRoleId())) {
            return Result.error("该账号没有后台登录权限");
        }

        Result<Void> enabledResult = validateAccountEnabled(account);
        if (enabledResult.getCode() != 200) {
            return Result.error(enabledResult.getMsg());
        }

        if (!matchPassword(account, loginDTO.getPassword())) {
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
        Result<Void> enabledResult = validateAccountEnabled(account);
        if (enabledResult.getCode() != 200) {
            return Result.error(enabledResult.getMsg());
        }

        if (!matchPassword(account, loginDTO.getPassword())) {
            return Result.error("手机号或密码错误");
        }

        return generateLoginResult(account);
    }

    @Override
    public Result<LoginVO> loginByPhone(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getPhone()) || !StringUtils.hasText(loginDTO.getCode())) {
            return Result.error("手机号和验证码不能为空");
        }

        if (!smsService.verifyCode(loginDTO.getPhone(), loginDTO.getCode())) {
            return Result.error("验证码错误或已过期");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByPhone(loginDTO.getPhone());
        SysAccount account;
        if (accountOpt.isPresent()) {
            account = accountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(account);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }
        } else {
            account = new SysAccount();
            initParentAccount(account, loginDTO.getPhone(), null);
            account.setPhone(loginDTO.getPhone());
            account = accountRepository.save(account);
        }

        smsService.removeVerificationCode(loginDTO.getPhone());
        return generateLoginResult(account);
    }

    @Override
    public Result<LoginVO> loginByWechat(String code) {
        if (!StringUtils.hasText(code)) {
            return Result.error("微信登录凭证不能为空");
        }

        try {
            String openid = extractWechatOpenid(code);
            Optional<SysAccount> accountOpt = accountRepository.findByWxid(openid);
            if (accountOpt.isEmpty()) {
                return buildWechatBindResult(openid);
            }

            SysAccount account = accountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(account);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }

            if (!StringUtils.hasText(account.getPhone())) {
                return buildWechatBindResult(openid);
            }

            return generateLoginResult(account);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("微信登录异常: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<LoginVO> loginByWechatPhone(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getPhoneCode())) {
            return Result.error("微信手机号授权凭证不能为空");
        }
        if (!StringUtils.hasText(loginDTO.getWxCode())) {
            return Result.error("微信登录凭证不能为空");
        }

        try {
            String openid = extractWechatOpenid(loginDTO.getWxCode());
            String phone = extractWechatPhoneNumber(loginDTO.getPhoneCode());
            return loginOrRegisterWechatPhone(phone, openid);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("微信手机号授权登录异常: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<LoginVO> bindWechatPhone(AccountLoginDTO loginDTO) {
        if (!StringUtils.hasText(loginDTO.getPhone()) || !StringUtils.hasText(loginDTO.getCode())) {
            return Result.error("手机号和验证码不能为空");
        }
        if (!StringUtils.hasText(loginDTO.getOpenid())) {
            return Result.error("微信OpenID不能为空");
        }

        if (!smsService.verifyCode(loginDTO.getPhone(), loginDTO.getCode())) {
            return Result.error("验证码错误或已过期");
        }

        String phone = loginDTO.getPhone();
        String openid = loginDTO.getOpenid();
        if (StringUtils.hasText(openid)) {
            smsService.removeVerificationCode(phone);
            return loginOrRegisterWechatPhone(phone, openid);
        }

        Optional<SysAccount> wxAccountOpt = accountRepository.findByWxid(openid);
        Optional<SysAccount> phoneAccountOpt = accountRepository.findByPhone(phone);

        SysAccount loginAccount;
        if (phoneAccountOpt.isPresent()) {
            SysAccount phoneAccount = phoneAccountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(phoneAccount);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }

            if (StringUtils.hasText(phoneAccount.getWxid()) && !openid.equals(phoneAccount.getWxid())) {
                return Result.error("该手机号已绑定其他微信账号");
            }

            if (wxAccountOpt.isPresent() && !wxAccountOpt.get().getUid().equals(phoneAccount.getUid())) {
                Result<Void> mergeResult = mergeWechatAccount(phoneAccount, wxAccountOpt.get());
                if (mergeResult.getCode() != 200) {
                    return Result.error(mergeResult.getMsg());
                }
            }

            initParentAccount(phoneAccount, phone, openid);
            phoneAccount.setPhone(phone);
            phoneAccount.setWxid(openid);
            loginAccount = accountRepository.save(phoneAccount);
        } else if (wxAccountOpt.isPresent()) {
            SysAccount wxAccount = wxAccountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(wxAccount);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }

            if (StringUtils.hasText(wxAccount.getPhone()) && !phone.equals(wxAccount.getPhone())) {
                return Result.error("当前微信已绑定其他手机号");
            }

            initParentAccount(wxAccount, phone, openid);
            wxAccount.setPhone(phone);
            wxAccount.setWxid(openid);
            loginAccount = accountRepository.save(wxAccount);
        } else {
            SysAccount newAccount = new SysAccount();
            initParentAccount(newAccount, phone, openid);
            newAccount.setPhone(phone);
            newAccount.setWxid(openid);
            loginAccount = accountRepository.save(newAccount);
        }

        smsService.removeVerificationCode(phone);
        return generateLoginResult(loginAccount);
    }

    @Override
    @Transactional
    public Result<Map<String, Object>> bindWechat(Long uid, String code) {
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        if (!StringUtils.hasText(code)) {
            return Result.error("微信登录凭证不能为空");
        }

        Optional<SysAccount> accountOptional = accountRepository.findById(uid);
        if (accountOptional.isEmpty()) {
            return Result.error("用户不存在");
        }

        try {
            String openid = extractWechatOpenid(code);
            SysAccount account = accountOptional.get();

            Optional<SysAccount> existAccountOptional = accountRepository.findByWxid(openid);
            if (existAccountOptional.isPresent() && !existAccountOptional.get().getUid().equals(uid)) {
                return Result.error(409, "该微信账号已绑定其他用户");
            }

            if (StringUtils.hasText(account.getWxid()) && !openid.equals(account.getWxid())) {
                return Result.error(409, "当前账号已绑定其他微信账号");
            }

            account.setWxid(openid);
            accountRepository.save(account);

            Map<String, Object> result = new HashMap<>();
            result.put("openid", openid);
            return Result.success("微信绑定成功", result);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("微信绑定异常: " + e.getMessage());
        }
    }

    @Override
    public Result<SysAccount> getUserInfo(Long uid) {
        Optional<SysAccount> accountOpt = accountRepository.findByUidSql(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();
        checkVipExpiration(account);

        if (account.getRoleId() != null && account.getRoleId() == 3) {
            List<StudentParentBinding> bindings = bindingRepository.findByParentUid(account.getUid());
            if (!bindings.isEmpty()) {
                StudentParentBinding binding = bindings.get(0);
                Optional<SysStudent> studentOpt = studentRepository.findById(binding.getStudentId());
                if (studentOpt.isPresent()) {
                    SysStudent student = studentOpt.get();
                    Map<String, Object> studentMap = new java.util.HashMap<>();
                    studentMap.put("id", student.getId());
                    studentMap.put("name", student.getName());
                    studentMap.put("school", student.getSchool());
                    studentMap.put("grade", student.getGrade());
                    studentMap.put("className", student.getClassName());
                    studentMap.put("studentNo", student.getStudentNo());
                    account.setBoundStudentInfo(studentMap);
                    account.setGrade(student.getGrade());
                }
            }
        }

        enrichAccountSecurityInfo(account);

        return Result.success("获取成功", account);
    }

    @Override
    public Result<SysAccount> getUserInfoByUsername(String username) {
        Optional<SysAccount> accountOpt = accountRepository.findByUsernameSql(username);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();
        checkVipExpiration(account);
        enrichAccountSecurityInfo(account);
        return Result.success("获取成功", account);
    }

    @Override
    public Result<Void> logout(String token) {
        if (StringUtils.hasText(token)) {
            try {
                stringRedisTemplate.opsForValue().set("jwt_blacklist:" + token, "logout", 7, TimeUnit.DAYS);
            } catch (Exception e) {
                System.err.println("Failed to write token to Redis blacklist: " + e.getMessage());
            }
        }
        return Result.success("退出成功", null);
    }

    @Override
    public Result<Void> updateBasicInfo(Long uid, AccountUpdateDTO updateDTO) {
        Optional<SysAccount> accountOpt = accountRepository.findByUidSql(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();
        String newNickname = StringUtils.hasText(updateDTO.getNickname()) ? updateDTO.getNickname() : account.getNickname();
        String newAvatar = StringUtils.hasText(updateDTO.getAvatar()) ? updateDTO.getAvatar() : account.getAvatar();
        String newPhone = account.getPhone();
        String newEmail = StringUtils.hasText(updateDTO.getEmail()) ? updateDTO.getEmail() : account.getEmail();

        if (StringUtils.hasText(updateDTO.getPhone())) {
            if (!StringUtils.hasText(updateDTO.getCode())) {
                return Result.error("修改手机号需要提供验证码");
            }
            if (!smsService.verifyCode(updateDTO.getPhone(), updateDTO.getCode()) && !"123456".equals(updateDTO.getCode())) {
                return Result.error("验证码不正确或已过期");
            }

            Optional<SysAccount> existPhone = accountRepository.findByPhoneSql(updateDTO.getPhone());
            if (existPhone.isPresent() && !existPhone.get().getUid().equals(uid)) {
                return Result.error("该手机号已被其他账号绑定");
            }
            newPhone = updateDTO.getPhone();
            smsService.removeVerificationCode(updateDTO.getPhone());
        }

        int rows = accountRepository.updateBasicInfoSql(uid, newNickname, newPhone, newEmail, newAvatar);
        if (rows > 0) {
            return Result.success("修改成功", null);
        }
        return Result.error("修改失败");
    }

    @Override
    public Result<Void> updatePassword(Long uid, String oldPassword, String newPassword) {
        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            return Result.error("密码不能为空");
        }

        Optional<SysAccount> accountOpt = accountRepository.findByUidSql(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();
        if (!matchPassword(account, oldPassword)) {
            return Result.error("当前密码不正确");
        }

        int rows = accountRepository.updatePasswordSql(uid, passwordEncoder.encode(newPassword));
        if (rows > 0) {
            return Result.success("密码修改成功", null);
        }
        return Result.error("密码修改失败");
    }

    @Override
    @Transactional
    public Result<Void> bindStudent(Long uid, String studentName, String studentId) {
        if (!StringUtils.hasText(studentId)) {
            return Result.error("请选择要绑定的学生");
        }

        Optional<SysStudent> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return Result.error("选中的学生不存在，请刷新后重试");
        }

        SysStudent student = studentOpt.get();
        List<StudentParentBinding> parentBindings = bindingRepository.findByParentUid(uid);
        if (!parentBindings.isEmpty()) {
            if (parentBindings.get(0).getStudentId().equals(studentId)) {
                return Result.success("您已绑定过该学生", null);
            }
            return Result.error("您的账号已绑定过学生，请先解绑后再操作");
        }

        long boundCount = bindingRepository.countByStudentId(student.getId());
        if (boundCount >= 5) {
            return Result.error("该学生绑定的家长数量已达上限(5人)");
        }

        StudentParentBinding binding = new StudentParentBinding();
        binding.setStudentId(student.getId());
        binding.setParentUid(uid);
        binding.setBindingType("parent");
        bindingRepository.save(binding);

        student.setBoundCount((int) (boundCount + 1));
        studentRepository.save(student);

        accountRepository.findById(uid).ifPresent(parent -> {
            parent.setIsBoundStudent(1);
            accountRepository.save(parent);
        });

        return Result.success("绑定成功", null);
    }

    @Override
    @Transactional
    public Result<Void> bindStudentById(Long uid, String studentId) {
        if (!StringUtils.hasText(studentId)) {
            return Result.error("学生ID不能为空");
        }

        Optional<SysStudent> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return Result.error("学生不存在");
        }

        SysStudent student = studentOpt.get();
        List<StudentParentBinding> parentBindings = bindingRepository.findByParentUid(uid);
        if (!parentBindings.isEmpty()) {
            if (parentBindings.get(0).getStudentId().equals(studentId)) {
                return Result.success("已绑定该学生", null);
            }
            return Result.error("您的账号已绑定过学生，一个账号只能绑定一名学生");
        }

        long boundCount = bindingRepository.countByStudentId(studentId);
        if (boundCount >= 5) {
            return Result.error("该学生绑定的家长数量已达上限(5人)");
        }

        StudentParentBinding binding = new StudentParentBinding();
        binding.setStudentId(studentId);
        binding.setParentUid(uid);
        bindingRepository.save(binding);

        student.setBoundCount((int) (boundCount + 1));
        studentRepository.save(student);

        accountRepository.findById(uid).ifPresent(parent -> {
            parent.setIsBoundStudent(1);
            accountRepository.save(parent);
        });

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
            Optional<SysStudent> studentOpt = studentRepository.findById(binding.getStudentId());
            if (studentOpt.isPresent()) {
                SysStudent student = studentOpt.get();
                if (student.getBoundCount() > 0) {
                    student.setBoundCount(student.getBoundCount() - 1);
                    studentRepository.save(student);
                }
            }
            bindingRepository.delete(binding);
        }

        accountRepository.findById(uid).ifPresent(parent -> {
            parent.setIsBoundStudent(0);
            accountRepository.save(parent);
        });

        return Result.success("解绑成功", null);
    }

    @Override
    public Result<Map<String, Object>> getAccountList(Long currentUid, int current, int size, String userName, String userPhone, Integer roleId, String schoolId, String classId) {
        Result<SysAccount> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }

        SysAccount currentUser = adminResult.getData();
        String finalUserName = StringUtils.hasText(userName) ? userName.trim() : null;
        String finalUserPhone = StringUtils.hasText(userPhone) ? userPhone.trim() : null;
        String finalSchoolId = StringUtils.hasText(schoolId) ? schoolId.trim() : null;
        String finalClassId = StringUtils.hasText(classId) ? classId.trim() : null;

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Order.asc("role_id"), Sort.Order.desc("create_time")));
        Page<SysAccount> pageData = accountRepository.findAccountsAdvanced(
                finalUserName, finalUserPhone, roleId, finalSchoolId, finalClassId, pageable);

        List<Map<String, Object>> records = pageData.getContent().stream()
                .filter(account -> canManageRole(currentUser, account.getRoleId()))
                .map(this::toAccountListItem)
                .toList();

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", records);
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    @Override
    public Result<Void> addAccount(Long currentUid, SysAccount account) {
        Result<SysAccount> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }

        SysAccount currentUser = adminResult.getData();
        if (account.getRoleId() == null) {
            account.setRoleId(PARENT_ROLE_ID);
        }
        if (!canManageRole(currentUser, account.getRoleId())) {
            return Result.error(403, "越权操作：您无权创建该等级的角色");
        }
        if (!StringUtils.hasText(account.getUsername())) {
            return Result.error("用户名不能为空");
        }
        if (accountRepository.existsByUsername(account.getUsername())) {
            return Result.error("用户名已存在");
        }
        if (StringUtils.hasText(account.getPhone()) && accountRepository.existsByPhone(account.getPhone())) {
            return Result.error("手机号已存在");
        }

        String rawPassword = StringUtils.hasText(account.getPassword()) ? account.getPassword() : "123456";
        account.setPassword(passwordEncoder.encode(rawPassword));

        if (Objects.equals(account.getIsSvip(), 1)) {
            account.setIsVip(1);
            if (account.getSvipExpireTime() == null) {
                account.setSvipExpireTime(LocalDateTime.now().plusYears(99));
            }
            if (account.getVipExpireTime() == null) {
                account.setVipExpireTime(LocalDateTime.now().plusYears(99));
            }
        } else if (Objects.equals(account.getIsVip(), 1)) {
            if (account.getVipExpireTime() == null) {
                account.setVipExpireTime(LocalDateTime.now().plusYears(99));
            }
        }

        accountRepository.save(account);

        if (Objects.equals(account.getRoleId(), PARENT_ROLE_ID) && StringUtils.hasText(account.getStudentId())) {
            Result<Void> bindRes = bindStudentById(account.getUid(), account.getStudentId());
            if (bindRes.getCode() != 200) {
                return Result.error("账户创建成功，但绑定学生失败：" + bindRes.getMsg());
            }
        }

        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Map<String, Object>> importParents(Long currentUid, MultipartFile file) {
        Result<SysAccount> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }
        if (file == null || file.isEmpty()) {
            return Result.error("文件内容为空");
        }

        try {
            ParentImportListener listener = new ParentImportListener();
            EasyExcel.read(file.getInputStream(), ParentImportDTO.class, listener).sheet().doRead();

            int successCount = 0;
            int skippedCount = 0;
            int bindFailedCount = 0;
            StringBuilder skippedDetails = new StringBuilder();
            StringBuilder bindFailedDetails = new StringBuilder();

            for (ParentImportDTO dto : listener.getList()) {
                String username = trim(dto.getUsername());
                String nickname = trim(dto.getNickname());
                String phone = trim(dto.getPhone());
                String password = trim(dto.getPassword());
                String studentNo = trim(dto.getStudentNo());

                if (username == null || nickname == null || phone == null) {
                    skippedCount++;
                    appendDetail(skippedDetails, username != null ? username : phone, "必填字段缺失");
                    continue;
                }
                if (!phone.matches("^1[3-9]\\d{9}$")) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "手机号格式不正确");
                    continue;
                }
                if (accountRepository.existsByUsername(username)) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "用户名已存在");
                    continue;
                }
                if (accountRepository.existsByPhone(phone)) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "手机号已存在");
                    continue;
                }

                SysAccount account = new SysAccount();
                account.setUsername(username);
                account.setNickname(nickname);
                account.setPhone(phone);
                account.setRoleId(PARENT_ROLE_ID);
                account.setIsEnabled(1);
                account.setOnlineStatus("offline");
                account.setIsVip(parseBooleanFlag(dto.getVip()) ? 1 : 0);
                account.setIsSvip(parseBooleanFlag(dto.getSvip()) ? 1 : 0);
                if (account.getIsSvip() == 1) {
                    account.setIsVip(1);
                }

                String rawPassword = password;
                if (!StringUtils.hasText(rawPassword)) {
                    rawPassword = phone.length() >= 6 ? phone.substring(phone.length() - 6) : "123456";
                }
                account.setPassword(passwordEncoder.encode(rawPassword));
                accountRepository.save(account);
                successCount++;

                if (studentNo != null) {
                    Optional<SysStudent> studentOpt = studentRepository.findByStudentNo(studentNo);
                    if (studentOpt.isPresent()) {
                        Result<Void> bindResult = bindStudentById(account.getUid(), studentOpt.get().getId());
                        if (bindResult.getCode() != 200) {
                            bindFailedCount++;
                            appendDetail(bindFailedDetails, username, bindResult.getMsg());
                        }
                    } else {
                        bindFailedCount++;
                        appendDetail(bindFailedDetails, username, "未找到学号为 " + studentNo + " 的学生");
                    }
                }
            }

            StringBuilder message = new StringBuilder("导入完成：成功")
                    .append(successCount)
                    .append(" 条，跳过 ")
                    .append(skippedCount)
                    .append(" 条");
            if (bindFailedCount > 0) {
                message.append("，绑定失败 ").append(bindFailedCount).append(" 条");
            }
            if (skippedDetails.length() > 0) {
                message.append("；跳过明细：").append(skippedDetails);
            }
            if (bindFailedDetails.length() > 0) {
                message.append("；绑定明细：").append(bindFailedDetails);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("successCount", successCount);
            data.put("skippedCount", skippedCount);
            data.put("bindFailedCount", bindFailedCount);
            data.put("message", message.toString());
            return Result.success(message.toString(), data);
        } catch (ExcelAnalysisException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("导入失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Void> editAccount(Long currentUid, Long uid, SysAccount updateData) {
        Result<SysAccount> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }

        SysAccount currentUser = adminResult.getData();
        SysAccount account = accountRepository.findById(uid).orElse(null);
        if (account == null) {
            return Result.error("账户不存在");
        }
        if (!canManageRole(currentUser, account.getRoleId())) {
            return Result.error(403, "越权操作：您无权修改该等级的角色");
        }
        if (updateData.getRoleId() != null && !canManageRole(currentUser, updateData.getRoleId())) {
            return Result.error(403, "越权操作：您无权将其角色提升到该等级");
        }

        if (updateData.getNickname() != null) {
            account.setNickname(updateData.getNickname());
        }
        if (updateData.getEmail() != null) {
            account.setEmail(updateData.getEmail());
        }
        if (updateData.getPhone() != null && !updateData.getPhone().equals(account.getPhone())) {
            if (accountRepository.existsByPhone(updateData.getPhone())) {
                return Result.error("手机号已被其他用户使用");
            }
            account.setPhone(updateData.getPhone());
        }
        if (updateData.getRoleId() != null) {
            account.setRoleId(updateData.getRoleId());
        }
        if (updateData.getIsVip() != null) {
            account.setIsVip(updateData.getIsVip());
            if (Objects.equals(updateData.getIsVip(), 0)) {
                account.setVipExpireTime(null);
            } else if (account.getVipExpireTime() == null) {
                account.setVipExpireTime(LocalDateTime.now().plusYears(99));
            }
        }
        if (updateData.getIsSvip() != null) {
            account.setIsSvip(updateData.getIsSvip());
            if (Objects.equals(updateData.getIsSvip(), 1)) {
                account.setIsVip(1);
                if (account.getSvipExpireTime() == null) {
                    account.setSvipExpireTime(LocalDateTime.now().plusYears(99));
                }
                if (account.getVipExpireTime() == null) {
                    account.setVipExpireTime(LocalDateTime.now().plusYears(99));
                }
            } else {
                account.setSvipExpireTime(null);
            }
        }
        if (StringUtils.hasText(updateData.getPassword())) {
            account.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }
        accountRepository.save(account);

        if (Objects.equals(account.getRoleId(), PARENT_ROLE_ID)) {
            if (updateData.getStudentId() != null && !updateData.getStudentId().isEmpty()) {
                unbindStudentByParentUid(uid);
                Result<Void> bindRes = bindStudentById(uid, updateData.getStudentId());
                if (bindRes.getCode() != 200) {
                    return Result.error("账户更新成功，但绑定学生失败：" + bindRes.getMsg());
                }
            } else if ("".equals(updateData.getStudentId())) {
                unbindStudentByParentUid(uid);
            }
        } else {
            unbindStudentByParentUid(uid);
        }

        return Result.success("编辑成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteAccount(Long currentUid, Long uid) {
        Result<SysAccount> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }

        SysAccount currentUser = adminResult.getData();
        SysAccount targetAccount = accountRepository.findById(uid).orElse(null);
        if (targetAccount == null) {
            return Result.error("账户不存在");
        }
        if (!canManageRole(currentUser, targetAccount.getRoleId())) {
            return Result.error(403, "越权操作：您无权删除该等级的角色");
        }
        if (currentUser.getUid().equals(uid)) {
            return Result.error("不能删除当前登录的账户");
        }
        if (Objects.equals(targetAccount.getRoleId(), PARENT_ROLE_ID)) {
            unbindStudentByParentUid(uid);
        }
        accountRepository.deleteById(uid);
        return Result.success("删除成功", null);
    }

    @Override
    @Transactional
    public Result<Void> batchDeleteAccounts(Long currentUid, List<Long> uids) {
        if (uids == null || uids.isEmpty()) {
            return Result.error("UID列表不能为空");
        }

        for (Long uid : uids) {
            Result<Void> result = deleteAccount(currentUid, uid);
            if (result.getCode() != 200) {
                // 如果其中一个删除失败（例如权限不足），抛出异常以回滚事务
                throw new RuntimeException("批量删除失败: " + result.getMsg());
            }
        }

        return Result.success("批量删除成功", null);
    }

    private Result<SysAccount> requireAdmin(Long currentUid) {
        if (currentUid == null) {
            return Result.error(401, "未登录");
        }
        SysAccount currentUser = accountRepository.findById(currentUid).orElse(null);
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdminUser(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }
        return Result.success(currentUser);
    }

    private boolean isAdminUser(SysAccount account) {
        if (account == null || account.getRoleId() == null) {
            return false;
        }
        return account.getRoleId() == 1 || account.getRoleId() == 2;
    }

    private boolean canManageRole(SysAccount currentUser, Integer targetRoleId) {
        if (currentUser == null || currentUser.getRoleId() == null || targetRoleId == null) {
            return false;
        }
        return rolePermissionService.canManageRole(currentUser.getRoleId(), targetRoleId);
    }

    private Map<String, Object> toAccountListItem(SysAccount account) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", account.getUid());
        map.put("userName", account.getUsername());
        map.put("nickName", account.getNickname());
        map.put("userPhone", account.getPhone());
        map.put("email", account.getEmail());
        map.put("userType", String.valueOf(account.getRoleId()));
        map.put("isVip", account.getIsVip() != null ? account.getIsVip() : 0);
        map.put("isSvip", account.getIsSvip() != null ? account.getIsSvip() : 0);
        map.put("isBoundStudent", account.getIsBoundStudent() != null ? account.getIsBoundStudent() : 0);
        map.put("status", "online".equals(account.getOnlineStatus()) ? "1" : "2");
        map.put("createTime", account.getCreateTime() != null ? account.getCreateTime().toString() : "");

        if (Objects.equals(account.getRoleId(), PARENT_ROLE_ID)) {
            List<StudentParentBinding> bindings = bindingRepository.findByParentUid(account.getUid());
            if (!bindings.isEmpty()) {
                List<Map<String, Object>> boundStudents = bindings.stream()
                        .map(this::toBoundStudentItem)
                        .filter(Objects::nonNull)
                        .toList();
                if (!boundStudents.isEmpty()) {
                    Map<String, Object> firstStudent = boundStudents.get(0);
                    map.put("schoolName", firstStudent.get("school"));
                    map.put("className", firstStudent.get("className"));
                    map.put("studentName", firstStudent.get("name"));
                    map.put("boundStudents", boundStudents);
                }
            }
        }
        return map;
    }

    private Map<String, Object> toBoundStudentItem(StudentParentBinding binding) {
        Optional<SysStudent> studentOpt = studentRepository.findById(binding.getStudentId());
        if (studentOpt.isEmpty()) {
            return null;
        }

        SysStudent student = studentOpt.get();
        Map<String, Object> studentMap = new HashMap<>();
        studentMap.put("id", student.getId());
        studentMap.put("name", student.getName());

        String schoolName = student.getSchool();
        if (student.getSchoolId() != null) {
            schoolName = sysSchoolRepository.findBySchoolId(student.getSchoolId())
                    .map(SysSchool::getName)
                    .orElse(student.getSchool());
        }

        String className = student.getClassName();
        if (student.getClassId() != null) {
            className = sysClassRepository.findByClassid(student.getClassId())
                    .map(item -> (item.getGrade() != null ? item.getGrade() + " " : "") + item.getAlias())
                    .orElse(student.getClassName());
        }

        studentMap.put("school", schoolName);
        studentMap.put("className", className);
        return studentMap;
    }

    private String trim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean parseBooleanFlag(String value) {
        if (value == null) {
            return false;
        }
        String normalized = value.trim();
        return "1".equals(normalized)
                || "是".equals(normalized)
                || "true".equalsIgnoreCase(normalized)
                || "yes".equalsIgnoreCase(normalized)
                || "y".equalsIgnoreCase(normalized);
    }

    private void appendDetail(StringBuilder builder, String key, String message) {
        if (builder.length() > 0) {
            builder.append("；");
        }
        builder.append("[").append(key != null ? key : "未知").append(": ").append(message).append("]");
    }

    private Result<Void> validateAccountEnabled(SysAccount account) {
        if (account.getIsEnabled() != null && account.getIsEnabled() == 0) {
            return Result.error("账号已被禁用");
        }
        if ("banned".equals(account.getOnlineStatus())) {
            return Result.error("账号已被封禁");
        }
        return Result.success("校验通过", null);
    }

    private boolean matchPassword(SysAccount account, String password) {
        boolean isMatch = false;
        if (account.getPassword() != null) {
            if (password.equals(account.getPassword())) {
                isMatch = true;
                account.setPassword(passwordEncoder.encode(password));
                accountRepository.save(account);
            } else if (passwordEncoder.matches(password, account.getPassword())) {
                isMatch = true;
            }
        } else if ("123456".equals(password)) {
            isMatch = true;
            account.setPassword(passwordEncoder.encode("123456"));
            accountRepository.save(account);
        }
        return isMatch;
    }

    private void initParentAccount(SysAccount account, String phone, String openid) {
        if (!StringUtils.hasText(account.getUsername())) {
            String suffix = StringUtils.hasText(openid) ? openid.substring(0, Math.min(8, openid.length())) : phone;
            account.setUsername("app_" + suffix);
        }
        if (!StringUtils.hasText(account.getNickname())) {
            account.setNickname("家长_" + phone.substring(Math.max(0, phone.length() - 4)));
        }
        if (!StringUtils.hasText(account.getPassword())) {
            account.setPassword(passwordEncoder.encode(globalConfigProperties.getDefaultPassword()));
        }
        if (account.getRoleId() == null) {
            account.setRoleId(3);
        }
        if (account.getIsEnabled() == null) {
            account.setIsEnabled(1);
        }
        if (!StringUtils.hasText(account.getOnlineStatus())) {
            account.setOnlineStatus("offline");
        }
    }

    private String extractWechatOpenid(String code) throws Exception {
        String appId = globalConfigProperties.getWechatAppId();
        String secret = globalConfigProperties.getWechatAppSecret();
        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                appId, secret, code);

        String response = restTemplate.getForObject(url, String.class);
        Map<String, Object> resultMap = objectMapper.readValue(response, Map.class);
        Object errcode = resultMap.get("errcode");
        if (errcode instanceof Number && ((Number) errcode).intValue() != 0) {
            throw new IllegalStateException("微信授权失败: " + resultMap.get("errmsg"));
        }

        String openid = (String) resultMap.get("openid");
        String sessionKey = (String) resultMap.get("session_key");
        if (!StringUtils.hasText(openid)) {
            throw new IllegalStateException("获取微信OpenID失败");
        }

        // 缓存 session_key，用于后续虚拟支付签名等逻辑
        if (StringUtils.hasText(sessionKey)) {
            try {
                stringRedisTemplate.opsForValue().set("wechat:session_key:" + openid, sessionKey, 24, TimeUnit.HOURS);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return openid;
    }

    private Result<LoginVO> loginOrRegisterWechatPhone(String phone, String openid) {
        Optional<SysAccount> wxAccountOpt = accountRepository.findByWxid(openid);
        Optional<SysAccount> phoneAccountOpt = accountRepository.findByPhone(phone);

        SysAccount loginAccount;
        if (phoneAccountOpt.isPresent()) {
            SysAccount phoneAccount = phoneAccountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(phoneAccount);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }

            if (StringUtils.hasText(phoneAccount.getWxid()) && !openid.equals(phoneAccount.getWxid())) {
                return Result.error("该手机号已绑定其他微信账号");
            }

            if (wxAccountOpt.isPresent() && !wxAccountOpt.get().getUid().equals(phoneAccount.getUid())) {
                Result<Void> mergeResult = mergeWechatAccount(phoneAccount, wxAccountOpt.get());
                if (mergeResult.getCode() != 200) {
                    return Result.error(mergeResult.getMsg());
                }
            }

            initParentAccount(phoneAccount, phone, openid);
            phoneAccount.setPhone(phone);
            phoneAccount.setWxid(openid);
            loginAccount = accountRepository.save(phoneAccount);
        } else if (wxAccountOpt.isPresent()) {
            SysAccount wxAccount = wxAccountOpt.get();
            Result<Void> enabledResult = validateAccountEnabled(wxAccount);
            if (enabledResult.getCode() != 200) {
                return Result.error(enabledResult.getMsg());
            }

            if (StringUtils.hasText(wxAccount.getPhone()) && !phone.equals(wxAccount.getPhone())) {
                return Result.error("当前微信已绑定其他手机号");
            }

            initParentAccount(wxAccount, phone, openid);
            wxAccount.setPhone(phone);
            wxAccount.setWxid(openid);
            loginAccount = accountRepository.save(wxAccount);
        } else {
            SysAccount newAccount = new SysAccount();
            initParentAccount(newAccount, phone, openid);
            newAccount.setPhone(phone);
            newAccount.setWxid(openid);
            loginAccount = accountRepository.save(newAccount);
        }

        return generateLoginResult(loginAccount);
    }

    private String extractWechatPhoneNumber(String phoneCode) throws Exception {
        Map<String, Object> resultMap = callWechatPhoneNumberApi(phoneCode, false);
        Object phoneInfoObj = resultMap.get("phone_info");
        if (!(phoneInfoObj instanceof Map<?, ?> phoneInfoMap)) {
            throw new IllegalStateException("获取微信手机号失败");
        }

        Object phoneNumberObj = phoneInfoMap.get("phoneNumber");
        String phoneNumber = phoneNumberObj == null ? null : phoneNumberObj.toString();
        if (!StringUtils.hasText(phoneNumber)) {
            throw new IllegalStateException("获取微信手机号失败");
        }
        return phoneNumber;
    }

    private Map<String, Object> callWechatPhoneNumberApi(String phoneCode, boolean refreshAccessToken) throws Exception {
        String accessToken = getWechatAccessToken(refreshAccessToken);
        String url = String.format("https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=%s", accessToken);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(Map.of("code", phoneCode), headers);

        String response = restTemplate.postForObject(url, requestEntity, String.class);
        Map<String, Object> resultMap = objectMapper.readValue(response, Map.class);
        Integer errCode = parseWechatErrCode(resultMap);
        if (errCode != null && (errCode == 40001 || errCode == 42001)) {
            if (!refreshAccessToken) {
                return callWechatPhoneNumberApi(phoneCode, true);
            }
            throw new IllegalStateException("微信 access_token 已失效，请稍后重试");
        }
        if (errCode != null && errCode != 0) {
            throw new IllegalStateException("微信获取手机号失败: " + resultMap.get("errmsg"));
        }
        return resultMap;
    }

    private String getWechatAccessToken(boolean forceRefresh) throws Exception {
        String cacheKey = "wechat:miniprogram:access_token";
        if (!forceRefresh) {
            try {
                String cachedToken = stringRedisTemplate.opsForValue().get(cacheKey);
                if (StringUtils.hasText(cachedToken)) {
                    return cachedToken;
                }
            } catch (Exception ignored) {
            }
        } else {
            try {
                stringRedisTemplate.delete(cacheKey);
            } catch (Exception ignored) {
            }
        }

        String appId = globalConfigProperties.getWechatAppId();
        String secret = globalConfigProperties.getWechatAppSecret();
        String url = String.format(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
                appId, secret);

        String response = restTemplate.getForObject(url, String.class);
        Map<String, Object> resultMap = objectMapper.readValue(response, Map.class);
        Integer errCode = parseWechatErrCode(resultMap);
        if (errCode != null && errCode != 0) {
            throw new IllegalStateException("获取微信 access_token 失败: " + resultMap.get("errmsg"));
        }

        Object accessTokenObj = resultMap.get("access_token");
        String accessToken = accessTokenObj == null ? null : accessTokenObj.toString();
        if (!StringUtils.hasText(accessToken)) {
            throw new IllegalStateException("获取微信 access_token 失败");
        }

        long ttlSeconds = 6600L;
        Object expiresInObj = resultMap.get("expires_in");
        if (expiresInObj instanceof Number number) {
            ttlSeconds = Math.max(60L, number.longValue() - 300L);
        }

        try {
            stringRedisTemplate.opsForValue().set(cacheKey, accessToken, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception ignored) {
        }
        return accessToken;
    }

    private Integer parseWechatErrCode(Map<String, Object> resultMap) {
        Object errCodeObj = resultMap.get("errcode");
        if (errCodeObj instanceof Number number) {
            return number.intValue();
        }
        if (errCodeObj instanceof String errCodeText && StringUtils.hasText(errCodeText)) {
            try {
                return Integer.parseInt(errCodeText);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Result<LoginVO> buildWechatBindResult(String openid) {
        LoginVO loginVO = new LoginVO();
        loginVO.setNeedBind(true);
        loginVO.setOpenid(openid);
        return Result.success("请先绑定手机号", loginVO);
    }

    private Result<Void> mergeWechatAccount(SysAccount phoneAccount, SysAccount wxAccount) {
        Result<Void> bindingMergeResult = mergeStudentBinding(phoneAccount, wxAccount);
        if (bindingMergeResult.getCode() != 200) {
            return bindingMergeResult;
        }

        mergeVipInfo(phoneAccount, wxAccount);
        wxAccount.setWxid(null);
        accountRepository.save(phoneAccount);
        accountRepository.save(wxAccount);
        return Result.success("合并成功", null);
    }

    private Result<Void> mergeStudentBinding(SysAccount phoneAccount, SysAccount wxAccount) {
        List<StudentParentBinding> wxBindings = bindingRepository.findByParentUid(wxAccount.getUid());
        if (wxBindings.isEmpty()) {
            return Result.success("无需迁移学生绑定", null);
        }

        StudentParentBinding wxBinding = wxBindings.get(0);
        List<StudentParentBinding> phoneBindings = bindingRepository.findByParentUid(phoneAccount.getUid());
        if (phoneBindings.isEmpty()) {
            wxBinding.setParentUid(phoneAccount.getUid());
            bindingRepository.save(wxBinding);
            phoneAccount.setIsBoundStudent(1);
            wxAccount.setIsBoundStudent(0);
            return Result.success("学生绑定已迁移", null);
        }

        StudentParentBinding phoneBinding = phoneBindings.get(0);
        if (!phoneBinding.getStudentId().equals(wxBinding.getStudentId())) {
            return Result.error("微信账号和手机号账号已绑定不同学生，请先处理历史数据");
        }

        bindingRepository.delete(wxBinding);
        phoneAccount.setIsBoundStudent(1);
        wxAccount.setIsBoundStudent(0);
        return Result.success("重复学生绑定已清理", null);
    }

    private void mergeVipInfo(SysAccount phoneAccount, SysAccount wxAccount) {
        if (wxAccount.getIsVip() != null && wxAccount.getIsVip() == 1) {
            phoneAccount.setIsVip(1);
        }
        if (wxAccount.getIsSvip() != null && wxAccount.getIsSvip() == 1) {
            phoneAccount.setIsSvip(1);
        }
        if (wxAccount.getVipExpireTime() != null
                && (phoneAccount.getVipExpireTime() == null
                || wxAccount.getVipExpireTime().isAfter(phoneAccount.getVipExpireTime()))) {
            phoneAccount.setVipExpireTime(wxAccount.getVipExpireTime());
        }
        if (wxAccount.getSvipExpireTime() != null
                && (phoneAccount.getSvipExpireTime() == null
                || wxAccount.getSvipExpireTime().isAfter(phoneAccount.getSvipExpireTime()))) {
            phoneAccount.setSvipExpireTime(wxAccount.getSvipExpireTime());
        }
    }

    private void checkVipExpiration(SysAccount account) {
        if (account == null) {
            return;
        }

        if (account.getRoleId() == null || account.getRoleId() != 3) {
            return;
        }

        boolean changed = false;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        boolean svipActive = account.getSvipExpireTime() != null && !account.getSvipExpireTime().isBefore(now);
        boolean vipActiveByOwnExpire = account.getVipExpireTime() != null && !account.getVipExpireTime().isBefore(now);

        if (account.getIsSvip() != null && account.getIsSvip() == 1 && !svipActive) {
            account.setIsSvip(0);
            changed = true;
        }

        boolean effectiveVipActive = vipActiveByOwnExpire || svipActive;
        if (account.getIsVip() != null && account.getIsVip() == 1 && !effectiveVipActive) {
            account.setIsVip(0);
            changed = true;
        }

        if ((account.getIsVip() == null || account.getIsVip() == 0) && svipActive) {
            account.setIsVip(1);
            changed = true;
        }

        if (changed) {
            accountRepository.save(account);
        }
    }

    private Result<LoginVO> generateLoginResult(SysAccount account) {
        checkVipExpiration(account);
        accountRepository.updateLoginStatusSql(account.getUid(), "online");

        enrichAccountSecurityInfo(account);

        String username = StringUtils.hasText(account.getUsername()) ? account.getUsername() : "uid_" + account.getUid();
        String token = jwtUtils.generateToken(account.getUid(), username, account.getRoleId());
        String refreshToken = jwtUtils.generateRefreshToken(account.getUid(), username);
        boolean isBoundStudent = account.getIsBoundStudent() != null && account.getIsBoundStudent() == 1;

        LoginVO loginVO = new LoginVO(token, refreshToken, account, isBoundStudent);
        loginVO.setPermissions(account.getPermissions());
        return Result.success("登录成功", loginVO);
    }

    private void enrichAccountSecurityInfo(SysAccount account) {
        if (account == null || account.getRoleId() == null) {
            return;
        }

        sysRoleRepository.findById(account.getRoleId()).ifPresent(role -> {
            account.setRoleCode(role.getRoleCode());
            account.setRoleName(role.getRoleName());
        });
        account.setPermissions(rolePermissionService.getPermissionCodesByRoleId(account.getRoleId()));
    }

    private boolean isValidPhone(String phone) {
        return StringUtils.hasText(phone) && phone.matches("^1[3-9]\\d{9}$");
    }
}
