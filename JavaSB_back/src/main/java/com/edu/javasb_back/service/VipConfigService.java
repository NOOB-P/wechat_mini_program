package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipConfig;
import com.edu.javasb_back.model.entity.VipPricing;

import java.util.List;
import java.util.Map;

public interface VipConfigService {
    Result<List<VipConfig>> getEnabledVipOptions();

    Result<List<VipConfig>> getAllVipConfigs();

    Result<VipConfig> updateVipConfig(VipConfig config);

    Result<VipPricing> updatePricing(VipPricing pricing);

    Result<Void> toggleStatus(Map<String, Object> params);
}
