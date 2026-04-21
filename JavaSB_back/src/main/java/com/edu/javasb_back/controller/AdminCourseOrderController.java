package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.util.ExcelExportUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/order/course")
public class AdminCourseOrderController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private CourseOrderService courseOrderService;

    @LogOperation("后台查询课程订单列表")
    @PreAuthorize("hasAuthority('order:course:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getCourseOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer paymentStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return courseOrderService.getCourseOrderList(current, size, orderNo, userName, paymentStatus, startDate, endDate);
    }

    @LogOperation("后台导出课程订单")
    @PreAuthorize("hasAuthority('order:course:list')")
    @GetMapping("/export")
    public ResponseEntity<Resource> exportCourseOrders(
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer paymentStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<Map<String, Object>> orders = courseOrderService.getCourseOrderExportList(orderNo, userName, paymentStatus, startDate, endDate);
        List<String> headers = List.of("订单号", "用户名", "手机号", "课程名称", "订单金额", "支付方式", "支付状态", "下单时间", "更新时间");
        List<List<String>> rows = orders.stream()
                .map(order -> List.of(
                        valueOf(order.get("order_no")),
                        valueOf(order.get("user_name")),
                        valueOf(order.get("user_phone")),
                        valueOf(order.get("course_title")),
                        formatAmount(order.get("price")),
                        valueOf(order.get("payment_method")),
                        resolvePaymentStatus(order.get("payment_status")),
                        formatDateTime(order.get("create_time")),
                        formatDateTime(order.get("update_time"))
                ))
                .toList();
        return ExcelExportUtils.buildExcelResponse("课程订单", "课程订单.xlsx", headers, rows);
    }

    private String resolvePaymentStatus(Object status) {
        if (status == null) return "未知";
        int s = status instanceof Number ? ((Number) status).intValue() : 0;
        return switch (s) {
            case 1 -> "已支付";
            case 0 -> "待支付";
            case -1 -> "待支付（已过期）";
            default -> "未知";
        };
    }

    private String formatAmount(Object amount) {
        if (amount instanceof BigDecimal bigDecimal) {
            return bigDecimal.toPlainString();
        }
        if (amount instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue()).stripTrailingZeros().toPlainString();
        }
        return valueOf(amount);
    }

    private String formatDateTime(Object dateTime) {
        if (dateTime instanceof Timestamp timestamp) {
            return DATE_TIME_FORMATTER.format(timestamp.toLocalDateTime());
        }
        if (dateTime instanceof LocalDateTime localDateTime) {
            return DATE_TIME_FORMATTER.format(localDateTime);
        }
        return valueOf(dateTime);
    }

    private String valueOf(Object value) {
        return value == null ? "" : value.toString();
    }
}
