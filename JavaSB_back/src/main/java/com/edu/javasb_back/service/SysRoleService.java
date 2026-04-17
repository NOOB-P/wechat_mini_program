package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.List;
import java.util.Map;

public interface SysRoleService {
    Result<Map<String, Object>> getRoleList(int current, int size, String roleName, String roleCode, Integer status);

    Result<List<Map<String, Object>>> getRoleOptions();

    Result<Map<String, Object>> getRolePermissions(int current, int size, String roleName);
}
