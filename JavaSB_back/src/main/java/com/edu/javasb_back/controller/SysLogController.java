package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysLog;
import com.edu.javasb_back.repository.SysLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/log")
public class SysLogController {

    @Autowired
    private SysLogRepository sysLogRepository;

    @LogOperation("查询系统日志")
    @PreAuthorize("hasAuthority('system:log:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getLogList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Integer status) {

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<SysLog> pageData = sysLogRepository.findLogs(userName, operation, status, pageable);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageData.getContent());
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    @LogOperation("批量删除系统日志")
    @PreAuthorize("hasAuthority('system:log:delete')")
    @DeleteMapping("/batch")
    public Result<Void> deleteLogs(@RequestBody java.util.List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Result.error("请选择要删除的日志");
        }
        sysLogRepository.deleteAllById(ids);
        return Result.success("删除成功", null);
    }
}
