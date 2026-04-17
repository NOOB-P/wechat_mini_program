package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.BindStudentDTO;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.model.vo.LoginVO;
import com.edu.javasb_back.service.SysAccountService;
import com.edu.javasb_back.service.SysSchoolService;
import com.edu.javasb_back.service.SysStudentService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/auth")
public class AppAuthController {

    @Autowired
    private SysAccountService sysAccountService;

    @Autowired
    private SysSchoolService sysSchoolService;

    @Autowired
    private SysStudentService sysStudentService;

    @GetMapping("/provinces")
    public Result<List<String>> getProvinces() {
        return sysSchoolService.getProvinces();
    }

    @GetMapping("/cities")
    public Result<List<String>> getCities(@RequestParam String province) {
        return sysSchoolService.getCities(province);
    }

    @GetMapping("/schools")
    public Result<List<SysSchool>> getSchools(@RequestParam String city) {
        return sysSchoolService.getSchoolsByCity(city);
    }

    @GetMapping("/grades")
    public Result<List<String>> getGrades(@RequestParam String schoolId) {
        return sysStudentService.getGrades(schoolId);
    }

    @GetMapping("/classes")
    public Result<List<String>> getClasses(@RequestParam String schoolId, @RequestParam String grade) {
        return sysStudentService.getClasses(schoolId, grade);
    }

    @GetMapping("/students")
    public Result<List<SysStudent>> getStudents(
            @RequestParam String schoolId,
            @RequestParam String grade,
            @RequestParam String className) {
        return sysStudentService.getStudents(schoolId, grade, className);
    }

    @LogOperation("发送短信验证码")
    @PostMapping("/sendCode")
    public Result<String> sendCode(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.sendSmsCode(loginDTO.getPhone());
    }

    @LogOperation("小程序密码登录")
    @PostMapping("/login/password")
    public Result<LoginVO> appLoginByPassword(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.appLoginByPassword(loginDTO);
    }

    @LogOperation("小程序验证码登录")
    @PostMapping("/login/phone")
    public Result<LoginVO> loginByPhone(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.loginByPhone(loginDTO);
    }

    @LogOperation("小程序微信登录")
    @PostMapping("/login/wechat")
    public Result<LoginVO> loginByWechat(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.loginByWechat(loginDTO.getCode());
    }

    @LogOperation("小程序微信手机号授权登录")
    @PostMapping("/login/wechat/phone")
    public Result<LoginVO> loginByWechatPhone(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.loginByWechatPhone(loginDTO);
    }

    @LogOperation("小程序微信绑定手机号")
    @PostMapping("/login/wechat/bind-phone")
    public Result<LoginVO> bindWechatPhone(@RequestBody AccountLoginDTO loginDTO) {
        return sysAccountService.bindWechatPhone(loginDTO);
    }

    @LogOperation("确认绑定学生账号")
    @PostMapping("/bind-student/confirm")
    public Result<Void> bindStudentConfirm(@RequestBody BindStudentDTO bindDTO) {
        String uidStr = SecurityContextHolder.getContext().getAuthentication().getName();
        if (uidStr == null || "anonymousUser".equals(uidStr)) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.bindStudent(Long.parseLong(uidStr), bindDTO.getStudentName(), bindDTO.getStudentId());
    }

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
