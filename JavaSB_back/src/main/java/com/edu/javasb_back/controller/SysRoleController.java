package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.repository.SysRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/role")
public class SysRoleController {

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @LogOperation("查询角色列表")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getRoleList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Integer status) {

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<SysRole> pageData = sysRoleRepository.findRoles(roleName, roleCode, status, pageable);

        List<Map<String, Object>> records = pageData.getContent().stream().map(role -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", role.getId());
            map.put("roleName", role.getRoleName());
            map.put("roleCode", role.getRoleCode());
            map.put("description", role.getDescription());
            map.put("status", role.getStatus());
            map.put("createTime", role.getCreateTime() != null ? role.getCreateTime().toString() : "");
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", records);
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    /**
     * 获取启用状态的角色列表 (排除学生角色)
     */
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> getRoleOptions() {
        // 排除学生角色，避免硬编码 ID，使用 roleCode 判断
        List<SysRole> roles = sysRoleRepository.findAll().stream()
                .filter(role -> role.getStatus() != null && role.getStatus() == 1)
                .filter(role -> !"student".equalsIgnoreCase(role.getRoleCode()))
                .collect(Collectors.toList());

        List<Map<String, Object>> options = roles.stream().map(role -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", role.getId());
            map.put("roleName", role.getRoleName());
            map.put("roleCode", role.getRoleCode());
            return map;
        }).collect(Collectors.toList());

        return Result.success(options);
    }
}
