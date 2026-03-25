package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "parents")
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 11)
    private String phone;

    @Column(name = "openid_wx", unique = true, length = 100)
    private String openidWx;

    @Column(length = 100)
    private String nickname = "优题慧家长";

    @Column(length = 255)
    private String password;

    @Column(name = "real_name", length = 50)
    private String realName;

    @Column(name = "id_card", length = 100)
    private String idCard;

    @Column(length = 100)
    private String email;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "vip_level")
    private VipLevel vipLevel = VipLevel.Normal;

    @Column(name = "vip_expire")
    private LocalDateTime vipExpire;

    private Integer status = 1;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "login_ip", length = 45)
    private String loginIp;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    public enum VipLevel {
        Normal, VIP, SVIP
    }

    // 手动添加 Getter/Setter 解决 Lombok 环境兼容性问题
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getOpenidWx() { return openidWx; }
    public void setOpenidWx(String openidWx) { this.openidWx = openidWx; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRealName() { return realName; }
    public void setRealName(String realName) { this.realName = realName; }
    public String getIdCard() { return idCard; }
    public void setIdCard(String idCard) { this.idCard = idCard; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public VipLevel getVipLevel() { return vipLevel; }
    public void setVipLevel(VipLevel vipLevel) { this.vipLevel = vipLevel; }
    public LocalDateTime getVipExpire() { return vipExpire; }
    public void setVipExpire(LocalDateTime vipExpire) { this.vipExpire = vipExpire; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public String getLoginIp() { return loginIp; }
    public void setLoginIp(String loginIp) { this.loginIp = loginIp; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
