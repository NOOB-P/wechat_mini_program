package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;
import com.edu.javasb_back.service.PrintConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payment/print")
public class AdminPrintPricingController {

    @Autowired
    private PrintConfigService printConfigService;

    @LogOperation("后台查询打印配置")
    @PreAuthorize("hasAuthority('payment:print:list')")
    @GetMapping("/config")
    public Result<Map<String, Object>> getPrintConfig() {
        return printConfigService.getPrintConfig();
    }

    @LogOperation("后台批量更新纸张单价")
    @PreAuthorize("hasAuthority('payment:print:edit')")
    @PutMapping("/paper-prices")
    public Result<Void> updatePaperPrices(@RequestBody List<PaperPrice> paperPrices) {
        return printConfigService.updatePaperPrices(paperPrices);
    }

    @LogOperation("后台批量更新配送费用")
    @PreAuthorize("hasAuthority('payment:print:edit')")
    @PutMapping("/delivery-configs")
    public Result<Void> updateDeliveryConfigs(@RequestBody List<DeliveryConfig> deliveryConfigs) {
        return printConfigService.updateDeliveryConfigs(deliveryConfigs);
    }

    @LogOperation("后台保存单个配送配置")
    @PreAuthorize("hasAuthority('payment:print:edit')")
    @PostMapping("/delivery-config")
    public Result<DeliveryConfig> saveDeliveryConfig(@RequestBody DeliveryConfig deliveryConfig) {
        return printConfigService.saveDeliveryConfig(deliveryConfig);
    }

    @LogOperation("后台删除配送配置")
    @PreAuthorize("hasAuthority('payment:print:edit')")
    @DeleteMapping("/delivery-config/{id}")
    public Result<Void> deleteDeliveryConfig(@PathVariable Long id) {
        return printConfigService.deleteDeliveryConfig(id);
    }
}
