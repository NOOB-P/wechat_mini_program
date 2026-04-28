package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.utils.ExcelExportUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/order/vip")
public class AdminVipOrderController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private VipOrderService vipOrderService;

    @LogOperation("后台分页查询VIP订单")
    @PreAuthorize("hasAuthority('order:vip:list')")
    @GetMapping("/list")
    public Result<java.util.Map<String, Object>> getVipOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) Integer paymentStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return vipOrderService.getVipOrderList(current, size, keyword, sourceType, paymentStatus, startDate, endDate);
    }

    @LogOperation("后台导出VIP订单")
    @PreAuthorize("hasAuthority('order:vip:list')")
    @GetMapping("/export")
    public ResponseEntity<Resource> exportVipOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) Integer paymentStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<VipOrder> orders = vipOrderService.getVipOrderExportList(keyword, sourceType, paymentStatus, startDate, endDate);
        List<String> headers = List.of("订单号", "用户名", "手机号", "套餐类型", "开通学校", "购买周期", "开通来源", "订单金额", "支付方式", "支付状态", "下单时间", "更新时间");
        List<List<String>> rows = orders.stream()
                .map(order -> List.of(
                        valueOf(order.getOrderNo()),
                        valueOf(order.getUserName()),
                        valueOf(order.getUserPhone()),
                        valueOf(order.getPackageType()),
                        valueOf(order.getSchoolName()),
                        valueOf(order.getPeriod()),
                        resolveSourceType(order.getSourceType()),
                        formatAmount(order.getPrice()),
                        valueOf(order.getPaymentMethod()),
                        resolvePaymentStatus(order.getPaymentStatus()),
                        formatDateTime(order.getCreateTime()),
                        formatDateTime(order.getUpdateTime())
                ))
                .toList();
        return ExcelExportUtils.buildExcelResponse("VIP订单", "VIP订单.xlsx", headers, rows);
    }

    private String resolveSourceType(String sourceType) {
        if ("SCHOOL_GIFT".equalsIgnoreCase(sourceType)) {
            return "校讯通赠送";
        }
        return "在线购买";
    }

    private String resolvePaymentStatus(Integer paymentStatus) {
        return switch (paymentStatus == null ? 0 : paymentStatus) {
            case 1 -> "已支付";
            case 2 -> "已退款";
            default -> "待支付";
        };
    }

    private String formatAmount(BigDecimal amount) {
        return amount == null ? "0.00" : amount.toPlainString();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : DATE_TIME_FORMATTER.format(dateTime);
    }

    private String valueOf(Object value) {
        return value == null ? "" : value.toString();
    }
}
