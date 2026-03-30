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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/log")
public class SysLogController {

    @Autowired
    private SysLogRepository sysLogRepository;

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
}
