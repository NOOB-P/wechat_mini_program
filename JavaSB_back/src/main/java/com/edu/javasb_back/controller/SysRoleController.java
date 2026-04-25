package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/role")
public class SysRoleController {

    @Autowired
    private SysRoleService sysRoleService;

    @Autowired
    private RolePermissionService rolePermissionService;

    @LogOperation("获取角色列表")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> list(
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Integer status) {
        List<SysRole> roles = sysRoleService.getRoleList(roleName, roleCode, status);
        Map<String, Object> result = new HashMap<>();
        result.put("records", roles);
        result.put("total", roles.size());
        return Result.success("获取成功", result);
    }

    @LogOperation("获取角色选项")
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> options() {
        List<SysRole> roles = sysRoleService.getActiveRoles();
        List<Map<String, Object>> options = roles.stream()
                .filter(r -> !r.getRoleCode().equals("student")) // 排除学生角色
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("label", r.getRoleName());
                    map.put("value", r.getId());
                    return map;
                })
                .collect(Collectors.toList());
        return Result.success("获取成功", options);
    }

    @LogOperation("保存角色")
    @PreAuthorize("hasAuthority('system:role:save')")
    @PostMapping("/save")
    public Result<SysRole> save(@RequestBody SysRole role) {
        return Result.success("保存成功", sysRoleService.saveRole(role));
    }

    @LogOperation("更新角色")
    @PreAuthorize("hasAuthority('system:role:update')")
    @PutMapping("/edit/{id}")
    public Result<SysRole> update(@PathVariable Integer id, @RequestBody SysRole role) {
        role.setId(id);
        return Result.success("更新成功", sysRoleService.saveRole(role));
    }

    @LogOperation("删除角色")
    @PreAuthorize("hasAuthority('system:role:delete')")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        sysRoleService.deleteRole(id);
        return Result.success("删除成功", null);
    }

    @LogOperation("获取角色权限标识列表")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping("/permissions/{id}")
    public Result<List<String>> getPermissions(@PathVariable Integer id) {
        return Result.success("获取成功", rolePermissionService.getMenuPermissionsByRoleId(id));
    }

    @LogOperation("保存角色权限")
    @PreAuthorize("hasAuthority('system:role:update')")
    @PostMapping("/permissions/{id}")
    public Result<Void> savePermissions(@PathVariable Integer id, @RequestBody List<String> permissionCodes) {
        rolePermissionService.replaceRolePermissions(id, permissionCodes);
        return Result.success("保存成功", null);
    }
}
