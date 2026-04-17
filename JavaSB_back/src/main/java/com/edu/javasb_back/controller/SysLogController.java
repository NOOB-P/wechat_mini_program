package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.SysLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/log")
public class SysLogController {

    @Autowired
    private SysLogService sysLogService;

    @LogOperation("查询系统日志")
    @PreAuthorize("hasAuthority('system:log:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getLogList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Integer status) {
        return sysLogService.getLogList(current, size, userName, operation, status);
    }

    @LogOperation("批量删除系统日志")
    @PreAuthorize("hasAuthority('system:log:delete')")
    @DeleteMapping("/batch")
    public Result<Void> deleteLogs(@RequestBody List<Long> ids) {
        return sysLogService.deleteLogs(ids);
    }
}
