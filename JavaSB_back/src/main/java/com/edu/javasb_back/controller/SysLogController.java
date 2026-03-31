package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysLog;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/log")
public class SysLogController {

    @Autowired
    private SysLogRepository sysLogRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    /**
     * 分页查询系统日志
     */
    @LogOperation("查询系统日志")
    @GetMapping("/list")
    public Result<Map<String, Object>> getLogList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Integer status) {

        // Spring Data JPA 的页码从 0 开始
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Page<SysLog> pageData = sysLogRepository.findLogs(userName, operation, status, pageable);
        
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageData.getContent());
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);

        return Result.success("获取成功", resultData);
    }

    /**
     * 批量删除系统日志 (仅超级管理员可用)
     */
    @LogOperation("批量删除系统日志")
    @DeleteMapping("/batch")
    public Result<Void> deleteLogs(@RequestBody java.util.List<Long> ids) {
        // 从 SecurityContext 获取当前登录用户，判断是否有权限
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Result.error(401, "未登录");
        }
        
        String username = authentication.getName();
        Optional<SysAccount> accountOpt = sysAccountRepository.findByUsername(username);
        
        if (accountOpt.isEmpty() || accountOpt.get().getRoleId() == null || accountOpt.get().getRoleId() != 1) {
            return Result.error(403, "无权限执行此操作，仅超级管理员可用");
        }

        if (ids == null || ids.isEmpty()) {
            return Result.error("请选择要删除的日志");
        }
        
        sysLogRepository.deleteAllById(ids);
        return Result.success("删除成功", null);
    }
}
