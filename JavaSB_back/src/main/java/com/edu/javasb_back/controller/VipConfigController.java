package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipConfig;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.service.VipConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vip")
public class VipConfigController {

    @Autowired
    private VipConfigService vipConfigService;

    @GetMapping("/options")
    public Result<List<VipConfig>> getEnabledVipOptions() {
        return vipConfigService.getEnabledVipOptions();
    }

    @PreAuthorize("hasAuthority('payment:vip:list')")
    @GetMapping("/admin/list")
    public Result<List<VipConfig>> getAllVipConfigs() {
        return vipConfigService.getAllVipConfigs();
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @PostMapping("/admin/update-config")
    public Result<VipConfig> updateVipConfig(@RequestBody VipConfig config) {
        return vipConfigService.updateVipConfig(config);
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @PostMapping("/admin/update-pricing")
    public Result<VipPricing> updatePricing(@RequestBody VipPricing pricing) {
        return vipConfigService.updatePricing(pricing);
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @PostMapping("/admin/toggle-status")
    public Result<Void> toggleStatus(@RequestBody Map<String, Object> params) {
        return vipConfigService.toggleStatus(params);
    }
}
