package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.service.PrintOrderService;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/app/order/print")
public class AppPrintOrderController {

    @Autowired
    private PrintOrderService printOrderService;

    @Autowired
    private SysAccountService sysAccountService;

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

        return printOrderService.getMyPrintOrders(uid);
    }
}
