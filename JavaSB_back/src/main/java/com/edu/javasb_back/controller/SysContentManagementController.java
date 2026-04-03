package com.edu.javasb_back.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysRole;
import com.edu.javasb_back.model.entity.SysUserModule;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysRoleRepository;
import com.edu.javasb_back.repository.SysUserModuleRepository;

@RestController
@RequestMapping("/api/admin/content-management")
public class SysContentManagementController {

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private SysRoleRepository sysRoleRepository;

    @Autowired
    private SysUserModuleRepository sysUserModuleRepository;

    /**
     * 获取仅限 "后台管理" 角色的用户列表
     */
    @GetMapping("/users")
    public Result<Map<String, Object>> getAdminUsers(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName) {

        // 固定使用 role_id = 2 (后台管理)
        Integer adminRoleId = 2;

        Pageable pageable = PageRequest.of(current - 1, size);
        Page<SysAccount> userPage;
        
        if (userName != null && !userName.isEmpty()) {
            userPage = sysAccountRepository.findByRoleIdAndUsernameContaining(adminRoleId, userName, pageable);
        } else {
            userPage = sysAccountRepository.findByRoleId(adminRoleId, pageable);
        }

        List<Map<String, Object>> records = userPage.getContent().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("uid", user.getUid());
            map.put("userName", user.getUsername());
            map.put("nickName", user.getNickname());
            map.put("userRoles", List.of("admin"));
            
            // 获取已分配的模块
            List<String> allowedModules = sysUserModuleRepository.findByUid(user.getUid())
                    .stream()
                    .map(SysUserModule::getModulePath)
                    .collect(Collectors.toList());
            map.put("allowedModules", allowedModules);
            
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("records", records);
        data.put("total", userPage.getTotalElements());
        data.put("current", current);
        data.put("size", size);

        return Result.success(data);
    }

    /**
     * 保存用户模块权限
     */
    @PostMapping("/save")
    @Transactional
    public Result<Void> saveUserPermissions(@RequestBody Map<String, Object> payload) {
        Long uid = Long.valueOf(payload.get("uid").toString());
        List<String> modulePaths = (List<String>) payload.get("allowedModules");

        // 权限检查：确保目标用户确实是 admin 角色 (role_id=2)
        SysAccount user = sysAccountRepository.findById(uid).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        if (user.getRoleId() == null || !user.getRoleId().equals(2)) {
            return Result.error("只能为后台管理角色分配模块权限");
        }

        // 先删除旧权限
        sysUserModuleRepository.deleteByUid(uid);

        // 插入新权限
        if (modulePaths != null && !modulePaths.isEmpty()) {
            List<SysUserModule> modules = modulePaths.stream().map(path -> {
                SysUserModule m = new SysUserModule();
                m.setUid(uid);
                m.setModulePath(path);
                return m;
            }).collect(Collectors.toList());
            sysUserModuleRepository.saveAll(modules);
        }

        return Result.success(null);
    }
}
