package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.PrintOrderService;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 小程序端打印订单控制器
 */
@RestController
@RequestMapping("/api/app/order/print")
public class AppPrintOrderController {

    @Autowired
    private PrintOrderService printOrderService;

    @Autowired
    private SysAccountService sysAccountService;

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

    @LogOperation("小程序获取我的打印记录")
    @GetMapping("/list")
    public Result<List<PrintOrder>> getMyPrintOrders() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");

        Result<SysAccount> userResult = sysAccountService.getUserInfo(uid);
        if (userResult.getCode() != 200 || userResult.getData() == null) {
            return Result.error("获取用户信息失败");
        }
        
        String phone = userResult.getData().getPhone();
        if (phone == null || phone.isEmpty()) {
            return Result.success(List.of());
        }

        // 使用现有的 findByParams 方法，按手机号/用户名过滤
        // 注意：目前 PrintOrder 没有 userUid，暂时用手机号匹配（假设手机号唯一）
        // 如果后端 findByParams 支持按手机号查询更好，目前它支持按 userName 查询
        // 这里暂时传 phone 给 userName 参数进行尝试，或者之后完善后端
        Result<Map<String, Object>> result = printOrderService.findByParams(1, 100, null, phone, null, null, null);
        
        if (result.getCode() == 200 && result.getData() != null) {
            List<PrintOrder> list = (List<PrintOrder>) result.getData().get("records");
            return Result.success(list);
        }
        
        return Result.success(List.of());
    }
}
