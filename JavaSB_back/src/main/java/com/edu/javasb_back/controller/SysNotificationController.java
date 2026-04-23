package com.edu.javasb_back.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.service.SysNotificationService;

@RestController
@RequestMapping("/api/admin/notifications")
public class SysNotificationController {

    @Autowired
    private SysNotificationService sysNotificationService;

    @LogOperation("后台获取系统通知列表")
    @PreAuthorize("hasAuthority('system:notification:list')")
    @GetMapping("/list")
    public Result<List<SysNotification>> list(@RequestParam(required = false) String title) {
        return Result.success("获取成功", sysNotificationService.getAllNotifications(title));
    }

    @LogOperation("后台保存系统通知")
    @PreAuthorize("hasAuthority('system:notification:save')")
    @PostMapping("/save")
    public Result<SysNotification> save(@RequestBody SysNotification notification) {
        notification.setCategory("system");
        return Result.success("保存成功", sysNotificationService.saveNotification(notification));
    }

    @LogOperation("后台删除系统通知")
    @PreAuthorize("hasAuthority('system:notification:delete')")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sysNotificationService.deleteNotification(id);
        return Result.success("删除成功", null);
    }
}
