package com.edu.javasb_back.model.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "sys_accounts")
public class SysAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String nickname = "新用户";

    @Column(length = 255)
    private String avatar;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(length = 255)
    private String password;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 100)
    private String wxid;

    @Column(unique = true, length = 100)
    private String qqid;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "is_vip")
    private Integer isVip;

    @Column(name = "is_svip")
    private Integer isSvip;

    @Column(name = "online_status")
    private String onlineStatus = "offline"; // online, offline, banned

    @Column(name = "is_enabled")
    private Integer isEnabled = 1;

    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // 手动添加 Getter/Setter 解决部分环境 Lombok 未生效问题
    public Long getUid() { return uid; }
    public void setUid(Long uid) { this.uid = uid; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWxid() { return wxid; }
    public void setWxid(String wxid) { this.wxid = wxid; }

    public String getQqid() { return qqid; }
    public void setQqid(String qqid) { this.qqid = qqid; }

    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }

    public Integer getIsVip() { return isVip; }
    public void setIsVip(Integer isVip) { this.isVip = isVip; }

    public Integer getIsSvip() { return isSvip; }
    public void setIsSvip(Integer isSvip) { this.isSvip = isSvip; }

    public String getOnlineStatus() { return onlineStatus; }
    public void setOnlineStatus(String onlineStatus) { this.onlineStatus = onlineStatus; }

    public Integer getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Integer isEnabled) { this.isEnabled = isEnabled; }

    public LocalDateTime getLastLoginTime() { return lastLoginTime; }
    public void setLastLoginTime(LocalDateTime lastLoginTime) { this.lastLoginTime = lastLoginTime; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
