package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.service.PrintOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/order/print")
public class AdminPrintOrderController {

    @Autowired
    private PrintOrderService printOrderService;

    @LogOperation("后台查询打印订单列表")
    @PreAuthorize("hasAuthority('order:print:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getPrintOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer orderStatus) {
        Integer finalStatus = status != null ? status : orderStatus;
        return printOrderService.findByParams(current, size, orderNo, userName, finalStatus);
    }

    @LogOperation("后台查询打印订单详情")
    @PreAuthorize("hasAuthority('order:print:detail')")
    @GetMapping("/{id}")
    public Result<PrintOrder> getPrintOrderDetail(@PathVariable Long id) {
        return printOrderService.findById(id);
    }

    @LogOperation("后台更新打印订单状态")
    @PreAuthorize("hasAuthority('order:print:status')")
    @PutMapping("/{id}/status")
    public Result<Void> updatePrintOrderStatus(@PathVariable Long id, @RequestBody Map<String, Integer> statusMap) {
        Integer status = statusMap.get("status");
        if (status == null) {
            return Result.error("状态参数不能为空");
        }
        Result<PrintOrder> result = printOrderService.updateStatus(id, status);
        if (result.getCode() == 200) {
            return Result.success("更新成功", null);
        }
        return Result.error(result.getCode(), result.getMsg());
    }
}
