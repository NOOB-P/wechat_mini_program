package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "sys_vip_config")
public class VipConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tier_code", nullable = false, length = 20)
    private String tierCode;

    @Column(nullable = false, length = 50)
    private String title;

    @Column(name = "sub_title", length = 100)
    private String subTitle;

    @Column(columnDefinition = "TEXT")
    private String benefits; // JSON string

    @Column(name = "is_enabled")
    private Integer isEnabled = 1;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "vip_id")
    @OrderBy("sortOrder ASC")
    private List<VipPricing> pricings;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTierCode() { return tierCode; }
    public void setTierCode(String tierCode) { this.tierCode = tierCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubTitle() { return subTitle; }
    public void setSubTitle(String subTitle) { this.subTitle = subTitle; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public Integer getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Integer isEnabled) { this.isEnabled = isEnabled; }
    public List<VipPricing> getPricings() { return pricings; }
    public void setPricings(List<VipPricing> pricings) { this.pricings = pricings; }
}
