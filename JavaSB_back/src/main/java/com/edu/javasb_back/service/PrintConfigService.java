package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;

import java.util.List;
import java.util.Map;

/**
 * 打印配置服务接口
 */
public interface PrintConfigService {
    /**
     * 获取所有打印配置 (纸张单价、配送费)
     */
    Result<Map<String, Object>> getPrintConfig();

    /**
     * 批量更新纸张价格
     */
    Result<Void> updatePaperPrices(List<PaperPrice> paperPrices);

    /**
     * 批量更新配送费用
     */
    Result<Void> updateDeliveryConfigs(List<DeliveryConfig> deliveryConfigs);
}
