package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/role")
public class SysRoleController {

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    // 辅助方法：获取当前用户
    private SysAccount getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String currentUsername = authentication.getName();
        return sysAccountRepository.findByUsername(currentUsername).orElse(null);
    }

    // 辅助方法：检查当前用户是否为管理员
    private boolean isAdmin(SysAccount currentUser) {
        return currentUser != null && currentUser.getRoleId() != null &&
               (currentUser.getRoleId() == 1 || currentUser.getRoleId() == 2);
    }

    /**
     * 分页查询角色列表
     */
    @LogOperation("查询角色列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getRoleList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Integer status) {

        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<SysRole> pageData = sysRoleRepository.findRoles(roleName, roleCode, status, pageable);

        // 映射为前端期望的字段名
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
}