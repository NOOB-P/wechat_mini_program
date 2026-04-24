package com.edu.javasb_back.config;

import com.edu.javasb_back.common.permission.PermissionCatalog;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SystemNotificationPermissionInitializer {

    private static final String ROLE_PERMISSION_CACHE_PREFIX = "sys:role:permissions:";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    @PostConstruct
    public void initializePermissions() {
        ensureRolePermission("super_admin", PermissionCatalog.SYSTEM_NOTIFICATION_LIST);
        ensureRolePermission("super_admin", PermissionCatalog.SYSTEM_NOTIFICATION_SAVE);
        ensureRolePermission("super_admin", PermissionCatalog.SYSTEM_NOTIFICATION_DELETE);

        ensureRolePermission("admin", PermissionCatalog.SYSTEM_NOTIFICATION_LIST);
        ensureRolePermission("admin", PermissionCatalog.SYSTEM_NOTIFICATION_SAVE);
        ensureRolePermission("admin", PermissionCatalog.SYSTEM_NOTIFICATION_DELETE);

        evictRolePermissionCache();
    }

    private void ensureRolePermission(String roleCode, String permissionCode) {
        jdbcTemplate.update(
                """
                INSERT INTO sys_role_menu (role_id, permission_code)
                SELECT r.id, ?
                FROM sys_roles r
                WHERE r.role_code = ?
                  AND NOT EXISTS (
                      SELECT 1
                      FROM sys_role_menu m
                      WHERE m.role_id = r.id
                        AND m.permission_code = ?
                  )
                """,
                permissionCode,
                roleCode,
                permissionCode
        );
    }

    private void evictRolePermissionCache() {
        if (stringRedisTemplate == null) {
            return;
        }

        try {
            List<Integer> roleIds = jdbcTemplate.queryForList(
                    "SELECT id FROM sys_roles WHERE role_code IN ('super_admin', 'admin')",
                    Integer.class
            );
            for (Integer roleId : roleIds) {
                if (roleId != null) {
                    stringRedisTemplate.delete(ROLE_PERMISSION_CACHE_PREFIX + roleId);
                }
            }
        } catch (Exception ignored) {
        }
    }
}
