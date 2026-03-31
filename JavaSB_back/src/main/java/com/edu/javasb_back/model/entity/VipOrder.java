package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VIP/SVIP购买订单表
 */
@Data
@Entity
@Table(name = "vip_orders")
public class VipOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", unique = true, nullable = false, length = 50)
    private String orderNo;

    @Column(name = "user_uid", nullable = false)
    private Long userUid;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @Column(name = "user_phone", nullable = false, length = 20)
    private String userPhone;

    @Column(name = "package_type", nullable = false, length = 50)
    private String packageType; // VIP基础版/SVIP专业版

    @Column(nullable = false, length = 50)
    private String period; // 月包/季包/年包

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "payment_status")
    private Integer paymentStatus = 0; // 0-待支付, 1-已支付, 2-已退款

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // 微信/支付宝

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // 手动添加 Getter/Setter 解决部分环境 Lombok 未生效问题
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public Long getUserUid() { return userUid; }
    public void setUserUid(Long userUid) { this.userUid = userUid; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
    public String getPackageType() { return packageType; }
    public void setPackageType(String packageType) { this.packageType = packageType; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Integer paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
