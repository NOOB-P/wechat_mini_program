package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipConfig;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.repository.VipConfigRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vip")
public class VipConfigController {

    @Autowired
    private VipConfigRepository vipConfigRepository;

    @Autowired
    private VipPricingRepository vipPricingRepository;

    /**
     * 【小程序/通用】获取已启用的会员配置和价格
     */
    @GetMapping("/options")
    public Result<List<VipConfig>> getEnabledVipOptions() {
        List<VipConfig> list = vipConfigRepository.findByIsEnabledOrderBySortOrderAsc(1);
        return Result.success("获取成功", list);
    }

    /**
     * 【后台】获取所有会员配置 (包含禁用)
     */
    @GetMapping("/admin/list")
    public Result<List<VipConfig>> getAllVipConfigs() {
        List<VipConfig> list = vipConfigRepository.findAllByOrderBySortOrderAsc();
        return Result.success("获取成功", list);
    }

    /**
     * 【后台】保存/更新会员基础信息 (支持新增)
     */
    @PostMapping("/admin/update-config")
    public Result<VipConfig> updateVipConfig(@RequestBody VipConfig config) {
        if (config.getId() != null) {
            VipConfig exist = vipConfigRepository.findById(config.getId()).orElse(null);
            if (exist == null) return Result.error("配置不存在");
            exist.setTitle(config.getTitle());
            exist.setSubTitle(config.getSubTitle());
            exist.setBenefits(config.getBenefits());
            exist.setSortOrder(config.getSortOrder());
            exist.setTierCode(config.getTierCode());
            return Result.success("保存成功", vipConfigRepository.save(exist));
        } else {
            // 新增逻辑
            if (config.getPricings() == null || config.getPricings().isEmpty()) {
                // 初始化默认价格套餐
                // 这里可以根据需要添加逻辑
            }
            return Result.success("新增成功", vipConfigRepository.save(config));
        }
    }

    /**
     * 【后台】更新价格套餐
     */
    @PostMapping("/admin/update-pricing")
    public Result<VipPricing> updatePricing(@RequestBody VipPricing pricing) {
        VipPricing exist = vipPricingRepository.findById(pricing.getId()).orElse(null);
        if (exist == null) return Result.error("套餐不存在");

        exist.setCurrentPrice(pricing.getCurrentPrice());
        exist.setOriginalPrice(pricing.getOriginalPrice());
        exist.setPkgName(pricing.getPkgName());
        exist.setPkgDesc(pricing.getPkgDesc());
        
        return Result.success("保存成功", vipPricingRepository.save(exist));
    }

    /**
     * 【后台】切换启用状态
     */
    @PostMapping("/admin/toggle-status")
    public Result<Void> toggleStatus(@RequestBody Map<String, Object> params) {
        Integer id = (Integer) params.get("id");
        Integer isEnabled = (Integer) params.get("isEnabled");
        
        VipConfig exist = vipConfigRepository.findById(id).orElse(null);
        if (exist == null) return Result.error("配置不存在");
        
        exist.setIsEnabled(isEnabled);
        vipConfigRepository.save(exist);
        return Result.success("操作成功", null);
    }
}
