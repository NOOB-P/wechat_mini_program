package com.edu.javasb_back.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class AccountLoginDTO {
    
    @JsonAlias({"username", "userName"})
    private String username; // 后台管理账号登录使用
    
    private String phone;    // 家长端手机号登录使用
    private String password;
    private String code;     // 手机号验证码登录使用
    private String loginType; // 登录类型：password, phone
    private Integer roleId;   // 后台登录所选角色ID

    // 手动添加 Getter/Setter 解决部分环境 Lombok 未生效问题
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLoginType() {
        return loginType;
    }

    public void setLoginType(String loginType) {
        this.loginType = loginType;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }
}
