package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.service.PrintOrderService;
import com.edu.javasb_back.util.ExcelExportUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/order/print")
public class AdminPrintOrderController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Integer finalStatus = status != null ? status : orderStatus;
        return printOrderService.findByParams(current, size, orderNo, userName, finalStatus, startDate, endDate);
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

    @LogOperation("后台导出打印订单")
    @PreAuthorize("hasAuthority('order:print:list')")
    @GetMapping("/export")
    public ResponseEntity<Resource> exportPrintOrders(
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Integer finalStatus = status != null ? status : orderStatus;
        List<PrintOrder> orders = printOrderService.getPrintOrderExportList(orderNo, userName, finalStatus, startDate, endDate);
        List<String> headers = List.of("订单号", "用户名", "手机号", "文档名称", "打印规格", "页数", "配送方式", "订单金额", "订单状态", "下单时间", "更新时间");
        List<List<String>> rows = orders.stream()
                .map(order -> List.of(
                        valueOf(order.getOrderNo()),
                        valueOf(order.getUserName()),
                        valueOf(order.getUserPhone()),
                        valueOf(order.getDocumentName()),
                        valueOf(order.getPrintType()),
                        order.getPages() == null ? "" : order.getPages().toString(),
                        valueOf(order.getDeliveryMethod()),
                        formatAmount(order.getTotalPrice()),
                        resolveOrderStatus(order.getOrderStatus()),
                        formatDateTime(order.getCreateTime()),
                        formatDateTime(order.getUpdateTime())
                ))
                .toList();
        return ExcelExportUtils.buildExcelResponse("打印订单", "打印订单.xlsx", headers, rows);
    }

    private String resolveOrderStatus(Integer orderStatus) {
        return switch (orderStatus == null ? -1 : orderStatus) {
            case 0 -> "已取消";
            case 1 -> "待支付";
            case 2 -> "待打印";
            case 3 -> "待配送";
            case 4 -> "已完成";
            default -> "未知";
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
