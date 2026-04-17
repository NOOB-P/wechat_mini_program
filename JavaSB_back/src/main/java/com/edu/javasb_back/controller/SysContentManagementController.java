package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/content-management")
public class SysContentManagementController {

    @Autowired
    private SysRoleService sysRoleService;

    @Autowired
    private RolePermissionService rolePermissionService;

    @PreAuthorize("hasAuthority('system:permission:list')")
    @GetMapping("/roles")
    public Result<Map<String, Object>> getRolePermissions(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String roleName) {
        return sysRoleService.getRolePermissions(current, size, roleName);
    }

    @PreAuthorize("hasAuthority('system:permission:options')")
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> getPermissionOptions() {
        return rolePermissionService.getPermissionOptions();
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
