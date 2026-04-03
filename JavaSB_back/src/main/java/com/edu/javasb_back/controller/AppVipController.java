package com.edu.javasb_back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.service.VipService;

/**
 * 小程序端VIP/SVIP购买接口
 */
@RestController
@RequestMapping("/api/app/vip")
public class AppVipController {

    @Autowired
    private VipOrderService vipOrderService;

    @Autowired
    private VipService vipService;

    // 辅助方法：获取当前用户的 UID
    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 创建VIP订单
     */
    @LogOperation("小程序创建VIP订单")
    @PostMapping("/order/create")
    public Result<VipOrder> createVipOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) return Result.error(401, "请先登录");
        return vipOrderService.createVipOrder(userUid, orderData);
    }

    /**
     * 获取 VIP 数据分析
     */
    @LogOperation("获取VIP数据分析")
    @GetMapping("/analysis")
    public Result<Map<String, Object>> getVipAnalysis() {
        Long userUid = getCurrentUid();
        if (userUid == null) return Result.error(401, "请先登录");
        return vipService.getVipAnalysis(userUid);
    }

    /**
     * 获取错题本列表
     */
    @LogOperation("获取错题本列表")
    @GetMapping("/wrongbook/list")
    public Result<List<Map<String, Object>>> getWrongBookList(@RequestParam Map<String, Object> params) {
        Long userUid = getCurrentUid();
        if (userUid == null) return Result.error(401, "请先登录");
        return vipService.getWrongBookList(userUid, params);
    }

    /**
     * 获取打印配置
     */
    @LogOperation("获取打印配置")
    @GetMapping("/print/config")
    public Result<Map<String, Object>> getPrintConfig() {
        return vipService.getPrintConfig();
    }

    /**
     * 提交打印订单
     */
    @LogOperation("提交打印订单")
    @PostMapping("/print/order")
    public Result<Void> submitPrintOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) return Result.error(401, "请先登录");
        return vipService.submitPrintOrder(userUid, orderData);
    }

    /**
     * 模拟支付成功回调
     */
    @LogOperation("小程序模拟支付回调")
    @PostMapping("/order/callback")
    public Result<String> paySuccessCallback(@RequestBody Map<String, String> data) {
        String orderNo = data.get("orderNo");
        return vipOrderService.paySuccessCallback(orderNo);
    }
}
