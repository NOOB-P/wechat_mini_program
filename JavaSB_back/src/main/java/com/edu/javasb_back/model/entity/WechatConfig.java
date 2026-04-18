package com.edu.javasb_back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "wechat_configs")
public class WechatConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @Column(name = "corp_id", nullable = false, length = 100)
    private String corpId;

    @Column(name = "customer_service_url", nullable = false, length = 500)
    private String customerServiceUrl;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "display_location", length = 50)
    private String displayLocation = "NONE";

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getCorpId() { return corpId; }
    public void setCorpId(String corpId) { this.corpId = corpId; }

    public String getCustomerServiceUrl() { return customerServiceUrl; }
    public void setCustomerServiceUrl(String customerServiceUrl) { this.customerServiceUrl = customerServiceUrl; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public String getDisplayLocation() { return displayLocation; }
    public void setDisplayLocation(String displayLocation) { this.displayLocation = displayLocation; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
