package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.BindStudentDTO;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 小程序端认证控制器
 */
@RestController
@RequestMapping("/api/app/auth")
public class AppAuthController {

    @Autowired
    private SysAccountService sysAccountService;

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysStudentRepository sysStudentRepository;

    /**
     * 获取所有启用的省份
     */
    @GetMapping("/provinces")
    public Result<List<String>> getProvinces() {
        return Result.success(sysSchoolRepository.findDistinctProvinces());
    }

    /**
     * 获取省份下的所有城市
     */
    @GetMapping("/cities")
    public Result<List<String>> getCities(@RequestParam String province) {
        return Result.success(sysSchoolRepository.findDistinctCities(province));
    }

    /**
     * 获取城市下的所有学校
     */
    @GetMapping("/schools")
    public Result<List<SysSchool>> getSchools(@RequestParam String city) {
        return Result.success(sysSchoolRepository.findByCity(city));
    }

    /**
     * 获取学校下的所有年级
     */
    @GetMapping("/grades")
    public Result<List<String>> getGrades(@RequestParam String schoolId) {
        return Result.success(sysStudentRepository.findDistinctGrades(schoolId));
    }

    /**
     * 获取学校年级下的所有班级
     */
    @GetMapping("/classes")
    public Result<List<String>> getClasses(@RequestParam String schoolId, @RequestParam String grade) {
        return Result.success(sysStudentRepository.findDistinctClasses(schoolId, grade));
    }

    /**
     * 获取学校年级班级下的所有学生
     */
    @GetMapping("/students")
    public Result<List<SysStudent>> getStudents(
            @RequestParam String schoolId,
            @RequestParam String grade,
            @RequestParam String className) {
        return Result.success(sysStudentRepository.findBySchoolIdAndGradeAndClassName(schoolId, grade, className));
    }

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

    /**
     * 微信登录 (小程序端使用)
     */
    @LogOperation("小程序微信登录")
    @PostMapping("/login/wechat")
    public Result<LoginVO> loginByWechat(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.loginByWechat(loginDTO.getCode());
    }



    /**
     * 确认绑定学生账号 (小程序端使用)
     */
    @LogOperation("确认绑定学生账号")
    @PostMapping("/bind-student/confirm")
    public Result<Void> bindStudentConfirm(@RequestBody BindStudentDTO bindDTO) {
        String uidStr = SecurityContextHolder.getContext().getAuthentication().getName();
        if (uidStr == null || "anonymousUser".equals(uidStr)) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.bindStudent(Long.parseLong(uidStr), bindDTO.getStudentName(), bindDTO.getStudentId());
    }

    /**
     * 解绑学生账号 (小程序端使用)
     */
    @LogOperation("小程序端解绑学生")
    @PostMapping("/unbind-student")
    public Result<Void> unbindStudent() {
        String uidStr = SecurityContextHolder.getContext().getAuthentication().getName();
        if (uidStr == null || "anonymousUser".equals(uidStr)) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.unbindStudentByParentUid(Long.parseLong(uidStr));
    }
}
