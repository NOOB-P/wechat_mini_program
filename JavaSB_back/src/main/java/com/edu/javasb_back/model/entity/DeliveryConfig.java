package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 配送费用配置
 */
@Data
@Entity
@Table(name = "delivery_configs")
public class DeliveryConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name; // 标准快递, 极速达, 自提

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // 基础运费

    @Column(name = "free_limit", precision = 10, scale = 2)
    private BigDecimal freeLimit; // 免运费额度

    @Column(length = 200)
    private String description;

    // 手动添加 Getter/Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getFreeLimit() { return freeLimit; }
    public void setFreeLimit(BigDecimal freeLimit) { this.freeLimit = freeLimit; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
