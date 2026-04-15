package com.edu.javasb_back.model.entity;

import java.time.LocalDateTime;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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

    @Column(name = "vip_expire_time")
    private LocalDateTime vipExpireTime;

    @Column(name = "online_status")
    private String onlineStatus = "offline"; // online, offline, banned

    @Column(name = "is_bound_student")
    private Integer isBoundStudent = 0; // 1-是, 0-否

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

    // Transient fields for request handling
     @Transient
    private String studentId;

    @Transient
    private String grade;

    @Transient
    private String roleCode;

    @Transient
    private String roleName;

    @Transient
    private java.util.List<String> permissions;

    @Transient
    private Map<String, Object> boundStudentInfo;

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

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public java.util.List<String> getPermissions() { return permissions; }
    public void setPermissions(java.util.List<String> permissions) { this.permissions = permissions; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

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

    public LocalDateTime getVipExpireTime() { return vipExpireTime; }
    public void setVipExpireTime(LocalDateTime vipExpireTime) { this.vipExpireTime = vipExpireTime; }

    public String getOnlineStatus() { return onlineStatus; }
    public void setOnlineStatus(String onlineStatus) { this.onlineStatus = onlineStatus; }

    public Integer getIsBoundStudent() { return isBoundStudent; }
    public void setIsBoundStudent(Integer isBoundStudent) { this.isBoundStudent = isBoundStudent; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Integer getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Integer isEnabled) { this.isEnabled = isEnabled; }

    public LocalDateTime getLastLoginTime() { return lastLoginTime; }
    public void setLastLoginTime(LocalDateTime lastLoginTime) { this.lastLoginTime = lastLoginTime; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }

    public java.util.Map<String, Object> getBoundStudentInfo() { return boundStudentInfo; }
    public void setBoundStudentInfo(java.util.Map<String, Object> boundStudentInfo) { this.boundStudentInfo = boundStudentInfo; }
}
