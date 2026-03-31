package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

/**
 * 小程序端VIP/SVIP购买接口
 */
@RestController
@RequestMapping("/api/app/vip")
public class AppVipController {

    @Autowired
    private VipOrderService vipOrderService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 创建VIP订单
     */
    @LogOperation("小程序创建VIP订单")
    @PostMapping("/order/create")
    public Result<VipOrder> createVipOrder(HttpServletRequest request, @RequestBody Map<String, Object> orderData) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录或Token无效");
        }
        
        // 智能截取：处理可能出现的重复 Bearer 前缀或空格
        String token = authHeader.replace("Bearer ", "").trim();
        try {
            Long userUid = jwtUtils.extractUid(token);
            if (userUid == null) {
                return Result.error(401, "Token无效，无法获取用户信息");
            }
            return vipOrderService.createVipOrder(userUid, orderData);
        } catch (Exception e) {
            return Result.error(401, "Token解析失败: " + e.getMessage());
        }
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
