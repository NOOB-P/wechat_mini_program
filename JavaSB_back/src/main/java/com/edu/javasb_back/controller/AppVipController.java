package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
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
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @LogOperation("mini app create vip order")
    @PostMapping("/order/create")
    public Result<VipOrder> createVipOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "请先登录");
        }
        return vipOrderService.createVipOrder(userUid, orderData);
    }

    @LogOperation("mini app get vip recharge config")
    @GetMapping("/config")
    public Result<Map<String, Object>> getRechargeConfig() {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "请先登录");
        }
        return vipService.getRechargeDisplayConfig(userUid);
    }

    @LogOperation("mini app get vip analysis")
    @GetMapping("/analysis")
    public Result<Map<String, Object>> getVipAnalysis() {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "请先登录");
        }
        return vipService.getVipAnalysis(userUid);
    }

    @LogOperation("mini app get wrong book list")
    @GetMapping("/wrongbook/list")
    public Result<List<Map<String, Object>>> getWrongBookList(@RequestParam Map<String, Object> params) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "请先登录");
        }
        return vipService.getWrongBookList(userUid, params);
    }

    @LogOperation("mini app get print config")
    @GetMapping("/print/config")
    public Result<Map<String, Object>> getPrintConfig() {
        return vipService.getPrintConfig();
    }

    @LogOperation("mini app submit print order")
    @PostMapping("/print/order")
    public Result<Void> submitPrintOrder(@RequestBody Map<String, Object> orderData) {
        Long userUid = getCurrentUid();
        if (userUid == null) {
            return Result.error(401, "请先登录");
        }
        return vipService.submitPrintOrder(userUid, orderData);
    }

    @LogOperation("mini app simulate payment callback")
    @PostMapping("/order/callback")
    public Result<String> paySuccessCallback(@RequestBody Map<String, String> data) {
        String orderNo = data.get("orderNo");
        return vipOrderService.paySuccessCallback(orderNo);
    }
}
