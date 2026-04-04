package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;
import com.edu.javasb_back.service.PrintConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 后台管理端打印价格设置
 */
@RestController
@RequestMapping("/api/admin/payment/print")
public class AdminPrintPricingController {

    @Autowired
    private PrintConfigService printConfigService;

    /**
     * 获取所有打印配置 (纸张单价、配送费)
     */
    @LogOperation("后台查询打印配置")
    @GetMapping("/config")
    public Result<Map<String, Object>> getPrintConfig() {
        return printConfigService.getPrintConfig();
    }

    /**
     * 批量更新纸张价格
     */
    @LogOperation("后台批量更新纸张单价")
    @PutMapping("/paper-prices")
    public Result<Void> updatePaperPrices(@RequestBody List<PaperPrice> paperPrices) {
        return printConfigService.updatePaperPrices(paperPrices);
    }

    /**
     * 批量更新配送费用
     */
    @LogOperation("后台批量更新配送费用")
    @PutMapping("/delivery-configs")
    public Result<Void> updateDeliveryConfigs(@RequestBody List<DeliveryConfig> deliveryConfigs) {
        return printConfigService.updateDeliveryConfigs(deliveryConfigs);
    }

    /**
     * 保存单个配送配置 (新增或修改)
     */
    @LogOperation("后台保存单个配送配置")
    @PostMapping("/delivery-config")
    public Result<DeliveryConfig> saveDeliveryConfig(@RequestBody DeliveryConfig deliveryConfig) {
        return printConfigService.saveDeliveryConfig(deliveryConfig);
    }

    /**
     * 删除配送配置
     */
    @LogOperation("后台删除配送配置")
    @DeleteMapping("/delivery-config/{id}")
    public Result<Void> deleteDeliveryConfig(@PathVariable Long id) {
        return printConfigService.deleteDeliveryConfig(id);
    }
}
