package com.edu.javasb_back.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.common.permission.PermissionCatalog;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.model.entity.SysRoleMenu;
import com.edu.javasb_back.repository.SysRoleMenuRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.service.RolePermissionService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RolePermissionServiceImpl implements RolePermissionService {

    private static final String ROLE_PERMISSION_CACHE_PREFIX = "sys:role:permissions:";

    @Autowired
    private SysRoleMenuRepository sysRoleMenuRepository;

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<String> getPermissionCodesByRoleId(Integer roleId) {
        if (roleId == null) {
            return List.of();
        }

        String cacheKey = ROLE_PERMISSION_CACHE_PREFIX + roleId;
        String cachedValue = null;
        try {
            cachedValue = stringRedisTemplate.opsForValue().get(cacheKey);
        } catch (Exception ignored) {
        }

        if (StringUtils.hasText(cachedValue)) {
            try {
                return objectMapper.readValue(cachedValue, new TypeReference<List<String>>() {
                });
            } catch (Exception ignored) {
            }
        }

        List<String> permissionCodes = sysRoleMenuRepository.findByRoleId(roleId).stream()
                .map(SysRoleMenu::getPermissionCode)
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));

        try {
            stringRedisTemplate.opsForValue().set(
                    cacheKey,
                    objectMapper.writeValueAsString(permissionCodes),
                    30,
                    TimeUnit.MINUTES
            );
        } catch (Exception ignored) {
        }

        return permissionCodes;
    }

    @Override
    public List<String> getMenuPermissionsByRoleId(Integer roleId) {
        Set<String> permissionCodes = new LinkedHashSet<>(getPermissionCodesByRoleId(roleId));
        return PermissionCatalog.getGroups().stream()
                .map(PermissionCatalog.PermissionGroup::menuPermission)
                .filter(permissionCodes::contains)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Override
    public List<PermissionCatalog.PermissionGroup> getPermissionGroups() {
        return PermissionCatalog.getGroups();
    }

    @Override
    @Transactional
    public void replaceRolePermissions(Integer roleId, List<String> menuPermissions) {
        if (roleId == null) {
            return;
        }

        Set<String> expandedPermissions = PermissionCatalog.expandMenuPermissions(menuPermissions);
        sysRoleMenuRepository.deleteByRoleId(roleId);
        sysRoleMenuRepository.flush();

        if (!expandedPermissions.isEmpty()) {
            List<SysRoleMenu> roleMenus = expandedPermissions.stream().map(permissionCode -> {
                SysRoleMenu roleMenu = new SysRoleMenu();
                roleMenu.setRoleId(roleId);
                roleMenu.setPermissionCode(permissionCode);
                return roleMenu;
            }).toList();
            sysRoleMenuRepository.saveAll(roleMenus);
        }

        evictRolePermissionCache(roleId);
    }

    @Override
    public boolean isBackofficeRole(Integer roleId) {
        return getRoleCode(roleId)
                .map(PermissionCatalog::isBackofficeRole)
                .orElse(false);
    }

    @Override
    public boolean canManageRole(Integer currentRoleId, Integer targetRoleId) {
        Optional<String> currentRoleCode = getRoleCode(currentRoleId);
        Optional<String> targetRoleCode = getRoleCode(targetRoleId);
        if (currentRoleCode.isEmpty() || targetRoleCode.isEmpty()) {
            return false;
        }
        return PermissionCatalog.getRolePriority(currentRoleCode.get())
                >= PermissionCatalog.getRolePriority(targetRoleCode.get());
    }

    @Override
    public Result<List<Map<String, Object>>> getPermissionOptions() {
        List<Map<String, Object>> options = getPermissionGroups().stream().map(group -> {
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

    private Optional<String> getRoleCode(Integer roleId) {
        if (roleId == null) {
            return Optional.empty();
        }
        return sysRoleRepository.findById(roleId).map(SysRole::getRoleCode);
    }

    private void evictRolePermissionCache(Integer roleId) {
        try {
            stringRedisTemplate.delete(ROLE_PERMISSION_CACHE_PREFIX + roleId);
        } catch (Exception ignored) {
        }
    }
}
