package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;
import com.edu.javasb_back.repository.DeliveryConfigRepository;
import com.edu.javasb_back.repository.PaperPriceRepository;
import com.edu.javasb_back.service.PrintConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 打印配置服务实现类
 */
@Service
@Transactional(readOnly = true)
public class PrintConfigServiceImpl implements PrintConfigService {

    @Autowired
    private PaperPriceRepository paperPriceRepository;

    @Autowired
    private DeliveryConfigRepository deliveryConfigRepository;

    @Override
    public Result<Map<String, Object>> getPrintConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("paperPrices", paperPriceRepository.findAll());
        config.put("deliveryConfigs", deliveryConfigRepository.findAll());
        
        // 其他配置也可以在这里扩展，如 mock data 中的 bindingPrice, minOrderPrice
        Map<String, Object> otherConfigs = new HashMap<>();
        otherConfigs.put("bindingPrice", 2.00);
        otherConfigs.put("minOrderPrice", 5.00);
        config.put("otherConfigs", otherConfigs);
        
        return Result.success(config);
    }

    @Override
    @Transactional
    public Result<Void> updatePaperPrices(List<PaperPrice> paperPrices) {
        paperPriceRepository.saveAll(paperPrices);
        return Result.success(null);
    }

    @Override
    @Transactional
    public Result<Void> updateDeliveryConfigs(List<DeliveryConfig> deliveryConfigs) {
        for (DeliveryConfig deliveryConfig : deliveryConfigs) {
            ensureDeliveryCode(deliveryConfig);
        }
        deliveryConfigRepository.saveAll(deliveryConfigs);
        return Result.success(null);
    }

    @Override
    @Transactional
    public Result<DeliveryConfig> saveDeliveryConfig(DeliveryConfig deliveryConfig) {
        ensureDeliveryCode(deliveryConfig);
        DeliveryConfig saved = deliveryConfigRepository.save(deliveryConfig);
        return Result.success(saved);
    }

    @Override
    @Transactional
    public Result<Void> deleteDeliveryConfig(Long id) {
        deliveryConfigRepository.deleteById(id);
        return Result.success(null);
    }

    private void ensureDeliveryCode(DeliveryConfig deliveryConfig) {
        if (deliveryConfig == null || StringUtils.hasText(deliveryConfig.getCode())) {
            return;
        }
        String name = deliveryConfig.getName();
        if ("标准快递".equals(name)) {
            deliveryConfig.setCode("standard");
            return;
        }
        if ("极速达".equals(name)) {
            deliveryConfig.setCode("express");
            return;
        }
        if ("自提".equals(name)) {
            deliveryConfig.setCode("pickup");
            return;
        }
        deliveryConfig.setCode("delivery_" + System.currentTimeMillis());
    }
}
