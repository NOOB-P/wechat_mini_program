package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.WechatConfig;
import com.edu.javasb_back.service.WechatConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/wechat")
public class WechatConfigController {

    @Autowired
    private WechatConfigService wechatConfigService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @LogOperation("查询企微客服配置列表")
    @GetMapping("/list")
    public Result<List<WechatConfig>> getList() {
        return wechatConfigService.getList();
    }

    @LogOperation("查询启用的企微客服配置")
    @GetMapping("/active")
    public Result<List<WechatConfig>> getActiveList() {
        return wechatConfigService.getActiveList();
    }

    @LogOperation("根据位置获取企微客服配置")
    @GetMapping("/get-by-location")
    public Result<WechatConfig> getByLocation(@RequestParam String location) {
        return wechatConfigService.getByLocation(location);
    }

    @LogOperation("新增企微客服配置")
    @PostMapping("/add")
    public Result<Void> add(@RequestBody WechatConfig config) {
        return wechatConfigService.add(getCurrentUid(), config);
    }

    @LogOperation("修改企微客服配置")
    @PutMapping("/edit/{id}")
    public Result<Void> edit(@PathVariable Integer id, @RequestBody WechatConfig updateData) {
        return wechatConfigService.edit(getCurrentUid(), id, updateData);
    }

    @LogOperation("删除企微客服配置")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        return wechatConfigService.delete(getCurrentUid(), id);
    }
}
