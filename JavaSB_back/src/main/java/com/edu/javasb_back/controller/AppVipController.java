package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.SchoolVipOpenDTO;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.service.VipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/app/vip")
public class AppVipController {

    @Autowired
    private VipOrderService vipOrderService;

    @Autowired
    private VipService vipService;

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

    @LogOperation("App create VIP order")
    @PostMapping("/order/create")
    public Result<VipOrder> createVipOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipOrderService.createVipOrder(userUid, orderData);
    }

    @LogOperation("App open school VIP")
    @PostMapping("/school/open")
    public Result<Map<String, Object>> openSchoolVip(@RequestBody SchoolVipOpenDTO request) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipOrderService.openSchoolVip(userUid, request == null ? null : request.getMonths());
    }

    @LogOperation("App get VIP config")
    @GetMapping("/config")
    public Result<Map<String, Object>> getRechargeConfig() {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipService.getRechargeDisplayConfig(userUid);
    }

    @LogOperation("Get VIP analysis")
    @GetMapping("/analysis")
    public Result<Map<String, Object>> getVipAnalysis() {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipService.getVipAnalysis(userUid);
    }

    @LogOperation("Get VIP wrong book list")
    @GetMapping("/wrongbook/list")
    public Result<List<Map<String, Object>>> getWrongBookList(@RequestParam Map<String, Object> params) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipService.getWrongBookList(userUid, params);
    }

    @LogOperation("Get print config")
    @GetMapping("/print/config")
    public Result<Map<String, Object>> getPrintConfig() {
        return vipService.getPrintConfig();
    }

    @LogOperation("Submit print order")
    @PostMapping("/print/order")
    public Result<Void> submitPrintOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "\u8bf7\u5148\u767b\u5f55");
        }
        return vipService.submitPrintOrder(userUid, orderData);
    }

    @LogOperation("Mock VIP pay callback")
    @PostMapping("/order/callback")
    public Result<String> paySuccessCallback(@RequestBody Map<String, String> data) {
        String orderNo = data.get("orderNo");
        return vipOrderService.paySuccessCallback(orderNo);
    }
}
