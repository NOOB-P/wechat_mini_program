package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.service.PrintOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 后台管理端打印订单管理
 */
@RestController
@RequestMapping("/api/admin/order/print")
public class AdminPrintOrderController {

    @Autowired
    private PrintOrderService printOrderService;

    /**
     * 分页查询打印订单
     */
    @LogOperation("后台查询打印订单列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getPrintOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer orderStatus) {
        return printOrderService.findByParams(current, size, orderNo, userName, orderStatus);
    }

    /**
     * 获取打印订单详情
     */
    @LogOperation("后台获取打印订单详情")
    @GetMapping("/{id}")
    public Result<PrintOrder> getPrintOrderDetail(@PathVariable Long id) {
        return printOrderService.findById(id);
    }

    /**
     * 更新打印订单状态
     */
    @LogOperation("后台更新打印订单状态")
    @PutMapping("/{id}/status")
    public Result<PrintOrder> updatePrintOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> statusMap) {
        Integer status = statusMap.get("status");
        if (status == null) {
            return Result.error("状态参数不能为空");
        }
        return printOrderService.updateStatus(id, status);
    }
}
