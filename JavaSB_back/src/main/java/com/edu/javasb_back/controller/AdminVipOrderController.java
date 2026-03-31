package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.service.VipOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 后台管理端VIP订单管理
 */
@RestController
@RequestMapping("/api/admin/order/vip")
public class AdminVipOrderController {

    @Autowired
    private VipOrderService vipOrderService;

    /**
     * 分页查询VIP订单
     */
    @LogOperation("后台查询VIP订单列表")
    @GetMapping("/list")
    public Result<java.util.Map<String, Object>> getVipOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer paymentStatus) {
        return vipOrderService.getVipOrderList(current, size, orderNo, userName, paymentStatus);
    }
}
