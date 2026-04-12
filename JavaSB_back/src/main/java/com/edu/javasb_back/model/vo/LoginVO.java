package com.edu.javasb_back.model.vo;

import com.edu.javasb_back.model.entity.SysAccount;
import lombok.Data;

@Data
public class LoginVO {
    private String token;
    private String refreshToken;
    private SysAccount userInfo;
    private Boolean isBoundStudent;
    private Boolean needBind;
    private String openid;

    public LoginVO() {}

    public LoginVO(String token, String refreshToken, SysAccount userInfo) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userInfo = userInfo;
    }

    public LoginVO(String token, String refreshToken, SysAccount userInfo, Boolean isBoundStudent) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userInfo = userInfo;
        this.isBoundStudent = isBoundStudent;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public SysAccount getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(SysAccount userInfo) {
        this.userInfo = userInfo;
    }

    public Boolean getIsBoundStudent() {
        return isBoundStudent;
    }

    public void setIsBoundStudent(Boolean isBoundStudent) {
        this.isBoundStudent = isBoundStudent;
    }

    public Boolean getNeedBind() {
        return needBind;
    }

    public void setNeedBind(Boolean needBind) {
        this.needBind = needBind;
    }

    public String getOpenid() {
        return openid;
    }

    public void setOpenid(String openid) {
        this.openid = openid;
    }
}
