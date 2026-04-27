package com.edu.javasb_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class VipOrderSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSchema() {
        ensureVipConfigTypeValueColumn();
        ensureAccountVipTypeColumn();
        ensureAccountVipConfigIdColumn();
        ensureSourceTypeColumn();
        ensureVipOrderVipTypeColumn();
        ensureVipOrderVipConfigIdColumn();
        ensureVipStartTimeColumn();
        backfillVipConfigTypeValue();
        backfillAccountVipType();
        backfillAccountVipConfigId();
        backfillSourceType();
        backfillVipOrderMembershipFields();
        dropLegacyVipColumns();
        dropLegacyVipTimeColumns();
    }

    private void ensureSourceTypeColumn() {
        addColumnIfMissing(
                "vip_orders",
                "source_type",
                "ALTER TABLE vip_orders ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'ONLINE_PURCHASE' " +
                        "COMMENT 'Order source: ONLINE_PURCHASE or SCHOOL_GIFT' AFTER payment_method"
        );
    }

    private void backfillSourceType() {
        jdbcTemplate.update(
                "UPDATE vip_orders SET source_type = COALESCE(NULLIF(source_type, ''), 'ONLINE_PURCHASE')"
        );
    }

    private void ensureVipStartTimeColumn() {
        addColumnIfMissing(
                "sys_accounts",
                "vip_start_time",
                "ALTER TABLE sys_accounts ADD COLUMN vip_start_time DATETIME NULL COMMENT 'VIP开始时间' AFTER vip_config_id"
        );
    }

    private void ensureVipConfigTypeValueColumn() {
        addColumnIfMissing(
                "sys_vip_config",
                "type_value",
                "ALTER TABLE sys_vip_config ADD COLUMN type_value INT NOT NULL DEFAULT 0 COMMENT '会员类型值: 1-VIP, 2-SVIP，可扩展' AFTER tier_code"
        );
    }

    private void ensureAccountVipTypeColumn() {
        addColumnIfMissing(
                "sys_accounts",
                "vip_type",
                "ALTER TABLE sys_accounts ADD COLUMN vip_type INT NOT NULL DEFAULT 0 COMMENT '当前会员类型: 0-普通, 1-VIP, 2-SVIP，可扩展' AFTER role_id"
        );
    }

    private void ensureAccountVipConfigIdColumn() {
        addColumnIfMissing(
                "sys_accounts",
                "vip_config_id",
                "ALTER TABLE sys_accounts ADD COLUMN vip_config_id INT NULL COMMENT '当前生效会员配置ID' AFTER vip_type"
        );
    }

    private void ensureVipOrderVipTypeColumn() {
        addColumnIfMissing(
                "vip_orders",
                "vip_type",
                "ALTER TABLE vip_orders ADD COLUMN vip_type INT NOT NULL DEFAULT 0 COMMENT '订单对应会员类型值' AFTER pricing_id"
        );
    }

    private void ensureVipOrderVipConfigIdColumn() {
        addColumnIfMissing(
                "vip_orders",
                "vip_config_id",
                "ALTER TABLE vip_orders ADD COLUMN vip_config_id INT NULL COMMENT '订单对应会员配置ID' AFTER vip_type"
        );
    }

    private void backfillVipConfigTypeValue() {
        jdbcTemplate.update(
                "UPDATE sys_vip_config SET type_value = CASE " +
                        "WHEN UPPER(tier_code) = 'SVIP' THEN 2 " +
                        "WHEN UPPER(tier_code) = 'VIP' THEN 1 " +
                        "ELSE type_value END " +
                        "WHERE type_value = 0 OR type_value IS NULL"
        );
    }

    private void backfillAccountVipType() {
        boolean hasIsSvip = hasColumn("sys_accounts", "is_svip");
        boolean hasIsVip = hasColumn("sys_accounts", "is_vip");
        boolean hasSvipExpireTime = hasColumn("sys_accounts", "svip_expire_time");
        boolean hasVipExpireTime = hasColumn("sys_accounts", "vip_expire_time");

        StringBuilder sql = new StringBuilder("UPDATE sys_accounts SET vip_type = CASE ");
        boolean hasAnyCondition = false;

        if (hasIsSvip) {
            sql.append("WHEN COALESCE(is_svip, 0) = 1 THEN 2 ");
            hasAnyCondition = true;
        }
        if (hasSvipExpireTime) {
            sql.append("WHEN svip_expire_time IS NOT NULL AND svip_expire_time >= NOW() THEN 2 ");
            hasAnyCondition = true;
        }
        if (hasIsVip) {
            sql.append("WHEN COALESCE(is_vip, 0) = 1 THEN 1 ");
            hasAnyCondition = true;
        }
        if (hasVipExpireTime) {
            sql.append("WHEN vip_expire_time IS NOT NULL AND vip_expire_time >= NOW() THEN 1 ");
            hasAnyCondition = true;
        }

        sql.append("ELSE 0 END WHERE vip_type = 0 OR vip_type IS NULL");

        if (hasAnyCondition) {
            jdbcTemplate.update(sql.toString());
        }
    }

    private void backfillAccountVipConfigId() {
        jdbcTemplate.update(
                "UPDATE sys_accounts sa " +
                        "LEFT JOIN sys_vip_config svc ON svc.type_value = sa.vip_type " +
                        "SET sa.vip_config_id = svc.id " +
                        "WHERE sa.vip_type > 0 AND (sa.vip_config_id IS NULL OR sa.vip_config_id = 0)"
        );
    }

    private void backfillVipOrderMembershipFields() {
        jdbcTemplate.update(
                "UPDATE vip_orders vo " +
                        "LEFT JOIN sys_vip_pricing vp ON vp.id = vo.pricing_id " +
                        "LEFT JOIN sys_vip_config svc ON svc.id = COALESCE(vo.vip_config_id, vp.vip_id) " +
                        "SET vo.vip_config_id = COALESCE(vo.vip_config_id, vp.vip_id, svc.id), " +
                        "vo.vip_type = CASE " +
                        "WHEN COALESCE(svc.type_value, 0) > 0 THEN svc.type_value " +
                        "WHEN UPPER(vo.package_type) LIKE '%SVIP%' THEN 2 " +
                        "WHEN UPPER(vo.package_type) LIKE '%VIP%' THEN 1 " +
                        "ELSE vo.vip_type END " +
                        "WHERE vo.vip_type = 0 OR vo.vip_type IS NULL OR vo.vip_config_id IS NULL"
        );
    }

    private void dropLegacyVipColumns() {
        dropColumnIfExists("sys_accounts", "is_vip");
        dropColumnIfExists("sys_accounts", "is_svip");
    }

    private void dropLegacyVipTimeColumns() {
        dropColumnIfExists("sys_accounts", "svip_start_time");
        dropColumnIfExists("sys_accounts", "svip_expire_time");
    }

    private void addColumnIfMissing(String tableName, String columnName, String alterSql) {
        if (!hasColumn(tableName, columnName)) {
            jdbcTemplate.execute(alterSql);
        }
    }

    private void dropColumnIfExists(String tableName, String columnName) {
        if (hasColumn(tableName, columnName)) {
            jdbcTemplate.execute(String.format("ALTER TABLE %s DROP COLUMN %s", tableName, columnName));
        }
    }

    private boolean hasColumn(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }
}
