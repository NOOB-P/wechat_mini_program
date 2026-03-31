package com.edu.javasb_back.model.dto;

import lombok.Data;

/**
 * 密码修改 DTO
 */
@Data
public class PasswordUpdateDTO {
    private String oldPassword; // 旧密码
    private String newPassword; // 新密码
    
    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
    
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
