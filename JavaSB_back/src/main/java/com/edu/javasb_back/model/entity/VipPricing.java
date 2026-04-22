package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "sys_vip_pricing")
public class VipPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "vip_id", nullable = false)
    private Integer vipId;

    @Column(name = "pkg_name", nullable = false, length = 20)
    private String pkgName;

    @Column(name = "pkg_desc", length = 50)
    private String pkgDesc;

    @Column(name = "current_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "is_best_value")
    private Integer isBestValue = 0;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "midas_product_id", length = 100)
    private String midasProductId;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getVipId() { return vipId; }
    public void setVipId(Integer vipId) { this.vipId = vipId; }
    public String getPkgName() { return pkgName; }
    public void setPkgName(String pkgName) { this.pkgName = pkgName; }
    public String getPkgDesc() { return pkgDesc; }
    public void setPkgDesc(String pkgDesc) { this.pkgDesc = pkgDesc; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public Integer getIsBestValue() { return isBestValue; }
    public void setIsBestValue(Integer isBestValue) { this.isBestValue = isBestValue; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public String getMidasProductId() { return midasProductId; }
    public void setMidasProductId(String midasProductId) { this.midasProductId = midasProductId; }
}
