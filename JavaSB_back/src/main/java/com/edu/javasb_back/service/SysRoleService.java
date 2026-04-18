package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysRole;
import java.util.List;
import java.util.Map;

public interface SysRoleService {
    List<SysRole> getRoleList(String roleName, String roleCode, Integer status);
    List<SysRole> getActiveRoles();
    SysRole saveRole(SysRole role);
    void deleteRole(Integer id);
    SysRole getRoleById(Integer id);
    Result<Map<String, Object>> getRolePermissions(int current, int size, String roleName);
    List<String> getRolePermissionCodes(Integer roleId);
    void saveRolePermissions(Integer roleId, List<String> permissionCodes);
}
