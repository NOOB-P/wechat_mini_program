package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;

import lombok.Data;

@Data
public class ParentImportDTO {
    @ExcelProperty("用户名")
    private String username;

    @ExcelProperty("昵称")
    private String nickname;

    @ExcelProperty("手机号")
    private String phone;

    @ExcelProperty("密码")
    private String password;

    @ExcelProperty("VIP")
    private String vip;

    @ExcelProperty("SVIP")
    private String svip;

    @ExcelProperty("学生学号")
    private String studentNo;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getVip() { return vip; }
    public void setVip(String vip) { this.vip = vip; }

    public String getSvip() { return svip; }
    public void setSvip(String svip) { this.svip = svip; }

    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
}
