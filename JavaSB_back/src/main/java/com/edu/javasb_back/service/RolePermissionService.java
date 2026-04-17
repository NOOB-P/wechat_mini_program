package com.edu.javasb_back.service;

import java.util.List;
import java.util.Map;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.common.permission.PermissionCatalog;

public interface RolePermissionService {

    List<String> getPermissionCodesByRoleId(Integer roleId);

    List<String> getMenuPermissionsByRoleId(Integer roleId);

    List<PermissionCatalog.PermissionGroup> getPermissionGroups();

    void replaceRolePermissions(Integer roleId, List<String> menuPermissions);

    boolean isBackofficeRole(Integer roleId);

    boolean canManageRole(Integer currentRoleId, Integer targetRoleId);

    Result<List<Map<String, Object>>> getPermissionOptions();
}
