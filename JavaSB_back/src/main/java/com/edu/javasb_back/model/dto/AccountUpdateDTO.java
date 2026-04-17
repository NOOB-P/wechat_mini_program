package com.edu.javasb_back.model.dto;

import lombok.Data;

/**
 * 账号基本信息修改 DTO
 */
@Data
public class AccountUpdateDTO {
    private String nickname; // 昵称
    private String avatar;   // 头像URL
    private String phone;    // 手机号
    private String email;    // 邮箱
    private String code;     // 验证码 (修改手机号时使用)
    
    // 手动添加 Getter 和 Setter
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
