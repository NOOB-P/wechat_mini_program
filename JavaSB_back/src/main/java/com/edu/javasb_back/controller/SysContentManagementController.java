package com.edu.javasb_back.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.service.RolePermissionService;

@RestController
@RequestMapping("/api/admin/content-management")
public class SysContentManagementController {

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private RolePermissionService rolePermissionService;

    @PreAuthorize("hasAuthority('system:permission:list')")
    @GetMapping("/roles")
    public Result<Map<String, Object>> getRolePermissions(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String roleName) {

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<com.edu.javasb_back.model.entity.SysRole> rolePage =
                sysRoleRepository.findRoles(roleName, null, null, pageable);

        List<Map<String, Object>> records = rolePage.getContent().stream().map(role -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", role.getId());
            map.put("roleName", role.getRoleName());
            map.put("roleCode", role.getRoleCode());
            map.put("description", role.getDescription());
            map.put("status", role.getStatus());
            map.put("permissionCodes", rolePermissionService.getMenuPermissionsByRoleId(role.getId()));
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("records", records);
        data.put("total", rolePage.getTotalElements());
        data.put("current", current);
        data.put("size", size);
        return Result.success("获取成功", data);
    }

    @PreAuthorize("hasAuthority('system:permission:options')")
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> getPermissionOptions() {
        List<Map<String, Object>> options = rolePermissionService.getPermissionGroups().stream().map(group -> {
            Map<String, Object> map = new HashMap<>();
            map.put("menuPermission", group.menuPermission());
            map.put("title", group.title());
            map.put("routePath", group.routePath());
            map.put("icon", group.icon());
            map.put("permissionCodes", group.permissionCodes());
            return map;
        }).collect(Collectors.toList());
        return Result.success("获取成功", options);
    }

    @PreAuthorize("hasAuthority('system:permission:edit')")
    @PostMapping("/save")
    public Result<Void> saveRolePermissions(@RequestBody Map<String, Object> payload) {
        Object roleIdValue = payload.get("roleId");
        if (roleIdValue == null) {
            return Result.error("角色ID不能为空");
        }

        Integer roleId = Integer.valueOf(roleIdValue.toString());
        @SuppressWarnings("unchecked")
        List<String> menuPermissions = (List<String>) payload.get("permissionCodes");
        rolePermissionService.replaceRolePermissions(roleId, menuPermissions);
        return Result.success("保存成功", null);
    }
}
