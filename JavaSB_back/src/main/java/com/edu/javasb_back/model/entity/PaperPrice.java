package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 纸张单价配置
 */
@Data
@Entity
@Table(name = "paper_prices")
public class PaperPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String type; // A4, A3

    @Column(nullable = false, length = 20)
    private String side; // 单面, 双面

    @Column(nullable = false, length = 20)
    private String color; // 黑白, 彩色

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "min_quantity")
    private Integer minQuantity = 1;

    @Column(length = 10)
    private String unit = "张";

    // 手动添加 Getter/Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getMinQuantity() { return minQuantity; }
    public void setMinQuantity(Integer minQuantity) { this.minQuantity = minQuantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
