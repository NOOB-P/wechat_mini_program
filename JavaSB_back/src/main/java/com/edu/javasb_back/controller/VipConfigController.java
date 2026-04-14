package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.VipConfig;
import com.edu.javasb_back.model.entity.VipConfigSchool;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.VipConfigRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/vip")
public class VipConfigController {

    @Autowired
    private VipConfigRepository vipConfigRepository;

    @Autowired
    private VipPricingRepository vipPricingRepository;

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @GetMapping("/options")
    public Result<List<VipConfig>> getEnabledVipOptions() {
        List<VipConfig> list = vipConfigRepository.findByIsEnabledOrderBySortOrderAsc(1);
        return Result.success("获取成功", list);
    }

    @PreAuthorize("hasAuthority('payment:vip:list')")
    @GetMapping("/admin/list")
    public Result<List<VipConfig>> getAllVipConfigs() {
        List<VipConfig> list = vipConfigRepository.findAllByOrderBySortOrderAsc();
        return Result.success("获取成功", list);
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @Transactional(rollbackFor = Exception.class)
    @PostMapping("/admin/update-config")
    public Result<VipConfig> updateVipConfig(@RequestBody VipConfig config) {
        Result<Void> schoolValidateResult = validateSchools(config.getSchools());
        if (schoolValidateResult.getCode() != 200) {
            return Result.error(schoolValidateResult.getCode(), schoolValidateResult.getMsg());
        }

        boolean isCreate = config.getId() == null;
        VipConfig target;
        if (config.getId() != null) {
            Optional<VipConfig> existOpt = vipConfigRepository.findById(config.getId());
            if (existOpt.isEmpty()) {
                return Result.error("配置不存在");
            }
            target = existOpt.get();
            // 先清空学校关联关系并强制刷新，解决唯一索引冲突问题
            if (target.getSchools() != null) {
                target.getSchools().clear();
                vipConfigRepository.saveAndFlush(target);
            }
        } else {
            target = new VipConfig();
        }

        target.setTitle(config.getTitle());
        target.setSubTitle(config.getSubTitle());
        target.setBenefits(config.getBenefits());
        target.setSortOrder(config.getSortOrder());
        target.setTierCode(config.getTierCode());
        if (config.getIsEnabled() != null) {
            target.setIsEnabled(config.getIsEnabled());
        }
        syncSchools(target, config.getSchools());

        VipConfig saved = vipConfigRepository.save(target);
        return Result.success(isCreate ? "新增成功" : "保存成功", saved);
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @PostMapping("/admin/update-pricing")
    public Result<VipPricing> updatePricing(@RequestBody VipPricing pricing) {
        VipPricing exist = vipPricingRepository.findById(pricing.getId()).orElse(null);
        if (exist == null) {
            return Result.error("套餐不存在");
        }

        exist.setCurrentPrice(pricing.getCurrentPrice());
        exist.setOriginalPrice(pricing.getOriginalPrice());
        exist.setPkgName(pricing.getPkgName());
        exist.setPkgDesc(pricing.getPkgDesc());
        return Result.success("保存成功", vipPricingRepository.save(exist));
    }

    @PreAuthorize("hasAuthority('payment:vip:edit')")
    @PostMapping("/admin/toggle-status")
    public Result<Void> toggleStatus(@RequestBody Map<String, Object> params) {
        Integer id = (Integer) params.get("id");
        Integer isEnabled = (Integer) params.get("isEnabled");

        VipConfig exist = vipConfigRepository.findById(id).orElse(null);
        if (exist == null) {
            return Result.error("配置不存在");
        }

        exist.setIsEnabled(isEnabled);
        vipConfigRepository.save(exist);
        return Result.success("操作成功", null);
    }

    private Result<Void> validateSchools(List<VipConfigSchool> schools) {
        if (CollectionUtils.isEmpty(schools)) {
            return Result.success("校验通过", null);
        }

        Set<String> schoolIds = new LinkedHashSet<>();
        for (VipConfigSchool school : schools) {
            if (school == null || !StringUtils.hasText(school.getSchoolId())) {
                return Result.error("开通学校不能为空");
            }
            schoolIds.add(school.getSchoolId());
        }

        List<SysSchool> existingSchools = sysSchoolRepository.findBySchoolIdIn(new ArrayList<>(schoolIds));
        if (existingSchools.size() != schoolIds.size()) {
            return Result.error("存在无效的学校配置，请刷新后重试");
        }
        return Result.success("校验通过", null);
    }

    private void syncSchools(VipConfig target, List<VipConfigSchool> incomingSchools) {
        if (target.getSchools() == null) {
            target.setSchools(new ArrayList<>());
        }
        target.getSchools().clear();

        if (CollectionUtils.isEmpty(incomingSchools)) {
            return;
        }

        Set<String> schoolIds = new LinkedHashSet<>();
        for (VipConfigSchool incomingSchool : incomingSchools) {
            if (incomingSchool == null || !StringUtils.hasText(incomingSchool.getSchoolId())) {
                continue;
            }
            if (!schoolIds.add(incomingSchool.getSchoolId())) {
                continue;
            }

            VipConfigSchool school = new VipConfigSchool();
            school.setSchoolId(incomingSchool.getSchoolId());
            school.setVipConfig(target);
            target.getSchools().add(school);
        }
    }
}
