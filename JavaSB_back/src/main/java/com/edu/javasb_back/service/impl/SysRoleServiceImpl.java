package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.model.entity.SysRoleMenu;
import com.edu.javasb_back.repository.SysRoleMenuRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SysRoleServiceImpl implements SysRoleService {

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private SysRoleMenuRepository sysRoleMenuRepository;

    @Override
    public List<SysRole> getRoleList(String roleName, String roleCode, Integer status) {
        SysRole role = new SysRole();
        role.setRoleName(roleName);
        role.setRoleCode(roleCode);
        role.setStatus(status);

        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("roleName", ExampleMatcher.GenericPropertyMatchers.contains())
                .withMatcher("roleCode", ExampleMatcher.GenericPropertyMatchers.contains())
                .withIgnoreNullValues();

        return sysRoleRepository.findAll(Example.of(role, matcher));
    }

    @Override
    public List<SysRole> getActiveRoles() {
        return sysRoleRepository.findByStatus(1);
    }

    @Override
    public SysRole saveRole(SysRole role) {
        return sysRoleRepository.save(role);
    }

    @Override
    public void deleteRole(Integer id) {
        sysRoleRepository.deleteById(id);
    }

    @Override
    public SysRole getRoleById(Integer id) {
        return sysRoleRepository.findById(id).orElse(null);
    }

    @Override
    public Result<Map<String, Object>> getRolePermissions(int current, int size, String roleName) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("id").ascending());
        Page<SysRole> page;
        if (org.springframework.util.StringUtils.hasText(roleName)) {
            page = sysRoleRepository.findByRoleNameContaining(roleName, pageable);
        } else {
            page = sysRoleRepository.findAll(pageable);
        }

        List<Map<String, Object>> list = page.getContent().stream().map(role -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", role.getId());
            map.put("roleName", role.getRoleName());
            map.put("roleCode", role.getRoleCode());
            map.put("description", role.getDescription());
            
            // 获取权限代码
            List<String> permissions = sysRoleMenuRepository.findByRoleId(role.getId()).stream()
                    .map(m -> m.getPermissionCode())
                    .collect(Collectors.toList());
            map.put("permissionCodes", permissions);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("records", list);
        result.put("total", page.getTotalElements());

        return Result.success("获取成功", result);
    }

    @Override
    public List<String> getRolePermissionCodes(Integer roleId) {
        return sysRoleMenuRepository.findByRoleId(roleId).stream()
                .map(SysRoleMenu::getPermissionCode)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void saveRolePermissions(Integer roleId, List<String> permissionCodes) {
        // 先删除旧权限
        List<SysRoleMenu> oldPermissions = sysRoleMenuRepository.findByRoleId(roleId);
        sysRoleMenuRepository.deleteAll(oldPermissions);

        // 保存新权限
        if (permissionCodes != null && !permissionCodes.isEmpty()) {
            List<SysRoleMenu> newPermissions = permissionCodes.stream().map(code -> {
                SysRoleMenu menu = new SysRoleMenu();
                menu.setRoleId(roleId);
                menu.setPermissionCode(code);
                return menu;
            }).collect(Collectors.toList());
            sysRoleMenuRepository.saveAll(newPermissions);
        }
    }
}
