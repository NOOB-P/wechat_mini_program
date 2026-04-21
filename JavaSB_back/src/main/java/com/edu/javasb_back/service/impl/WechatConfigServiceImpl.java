package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.WechatConfig;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.WechatConfigRepository;
import com.edu.javasb_back.service.WechatConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WechatConfigServiceImpl implements WechatConfigService {

    @Autowired
    private WechatConfigRepository wechatConfigRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    public Result<List<WechatConfig>> getList() {
        return Result.success("获取成功", wechatConfigRepository.findAllByOrderByUpdateTimeDesc());
    }

    @Override
    public Result<List<WechatConfig>> getActiveList() {
        return Result.success("获取成功", wechatConfigRepository.findByStatusOrderByUpdateTimeDesc(1));
    }

    @Override
    public Result<WechatConfig> getByLocation(String location) {
        List<WechatConfig> list =
                wechatConfigRepository.findByDisplayLocationAndStatusOrderByUpdateTimeDesc(location, 1);
        if (list.isEmpty()) {
            return Result.error("暂无配置");
        }
        return Result.success("获取成功", list.get(0));
    }

    @Override
    @Transactional
    public Result<Void> add(Long currentUid, WechatConfig config) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        Result<Void> validateResult = validateConfig(config);
        if (validateResult != null) {
            return validateResult;
        }
        normalizeConfig(config);
        wechatConfigRepository.save(config);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> edit(Long currentUid, Integer id, WechatConfig updateData) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        WechatConfig config = wechatConfigRepository.findById(id).orElse(null);
        if (config == null) {
            return Result.error("配置不存在");
        }

        if (updateData.getGroupName() != null) {
            config.setGroupName(updateData.getGroupName());
        }
        if (updateData.getCorpId() != null) {
            config.setCorpId(updateData.getCorpId());
        }
        if (updateData.getCustomerServiceUrl() != null) {
            config.setCustomerServiceUrl(updateData.getCustomerServiceUrl());
        }
        if (updateData.getStatus() != null) {
            config.setStatus(updateData.getStatus());
        }
        if (updateData.getDisplayLocation() != null) {
            config.setDisplayLocation(updateData.getDisplayLocation());
        }

        Result<Void> validateResult = validateConfig(config);
        if (validateResult != null) {
            return validateResult;
        }
        normalizeConfig(config);
        wechatConfigRepository.save(config);
        return Result.success("修改成功", null);
    }

    @Override
    @Transactional
    public Result<Void> delete(Long currentUid, Integer id) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        if (wechatConfigRepository.existsById(id)) {
            wechatConfigRepository.deleteById(id);
        }
        return Result.success("删除成功", null);
    }

    private Result<Void> requireAdmin(Long currentUid) {
        if (currentUid == null) {
            return Result.error(401, "未登录");
        }
        SysAccount currentUser = sysAccountRepository.findById(currentUid).orElse(null);
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        Integer roleId = currentUser.getRoleId();
        if (roleId == null || (roleId != 1 && roleId != 2)) {
            return Result.error(403, "无权限执行此操作");
        }
        return Result.success("校验通过", null);
    }

    private Result<Void> validateConfig(WechatConfig config) {
        if (config == null) {
            return Result.error("参数不能为空");
        }
        if (!StringUtils.hasText(config.getGroupName())) {
            return Result.error("配置名称不能为空");
        }
        if (!StringUtils.hasText(config.getCorpId())) {
            return Result.error("企微 ID 不能为空");
        }
        if (!StringUtils.hasText(config.getCustomerServiceUrl())) {
            return Result.error("客服链接不能为空");
        }

        String displayLocation = config.getDisplayLocation();
        if (StringUtils.hasText(displayLocation)
                && !"NONE".equals(displayLocation.trim())
                && !"HOME_BANNER".equals(displayLocation.trim())
                && !"HELP_SERVICE".equals(displayLocation.trim())) {
            return Result.error("展示位置不合法");
        }
        return null;
    }

    private void normalizeConfig(WechatConfig config) {
        config.setGroupName(config.getGroupName().trim());
        config.setCorpId(config.getCorpId().trim());
        config.setCustomerServiceUrl(config.getCustomerServiceUrl().trim());
        if (StringUtils.hasText(config.getDisplayLocation())) {
            config.setDisplayLocation(config.getDisplayLocation().trim());
        } else {
            config.setDisplayLocation("NONE");
        }
    }
}
