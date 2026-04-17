package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysRoleServiceImpl implements SysRoleService {

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private RolePermissionService rolePermissionService;

    @Override
    public Result<Map<String, Object>> getRoleList(int current, int size, String roleName, String roleCode, Integer status) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<SysRole> pageData = sysRoleRepository.findRoles(roleName, roleCode, status, pageable);

        List<Map<String, Object>> records = pageData.getContent().stream().map(this::toRoleItem).toList();
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", records);
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    @Override
    public Result<List<Map<String, Object>>> getRoleOptions() {
        List<Map<String, Object>> options = sysRoleRepository.findAll().stream()
                .filter(role -> role.getStatus() != null && role.getStatus() == 1)
                .filter(role -> !"student".equalsIgnoreCase(role.getRoleCode()))
                .map(role -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", role.getId());
                    map.put("roleName", role.getRoleName());
                    map.put("roleCode", role.getRoleCode());
                    return map;
                })
                .toList();
        return Result.success(options);
    }

    @Override
    public Result<Map<String, Object>> getRolePermissions(int current, int size, String roleName) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<SysRole> rolePage = sysRoleRepository.findRoles(roleName, null, null, pageable);

        List<Map<String, Object>> records = rolePage.getContent().stream().map(role -> {
            Map<String, Object> map = toRoleItem(role);
            map.put("permissionCodes", rolePermissionService.getMenuPermissionsByRoleId(role.getId()));
            return map;
        }).toList();

        Map<String, Object> data = new HashMap<>();
        data.put("records", records);
        data.put("total", rolePage.getTotalElements());
        data.put("current", current);
        data.put("size", size);
        return Result.success("获取成功", data);
    }

    private Map<String, Object> toRoleItem(SysRole role) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", role.getId());
        map.put("roleName", role.getRoleName());
        map.put("roleCode", role.getRoleCode());
        map.put("description", role.getDescription());
        map.put("status", role.getStatus());
        map.put("createTime", role.getCreateTime() != null ? role.getCreateTime().toString() : "");
        return map;
    }
}
