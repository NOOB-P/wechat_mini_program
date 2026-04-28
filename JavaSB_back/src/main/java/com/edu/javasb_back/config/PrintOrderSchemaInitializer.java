package com.edu.javasb_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PrintOrderSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSchema() {
        ensureUserUidColumn();
        ensureDeliveryAddressColumn();
        ensureDeliveryCodeColumn();
        backfillUserUid();
        backfillDeliveryCodes();
    }

    private void ensureUserUidColumn() {
        addColumnIfMissing(
                "print_orders",
                "user_uid",
                "ALTER TABLE print_orders ADD COLUMN user_uid BIGINT NULL COMMENT '下单用户UID' AFTER order_no"
        );
    }

    private void ensureDeliveryAddressColumn() {
        addColumnIfMissing(
                "print_orders",
                "delivery_address",
                "ALTER TABLE print_orders ADD COLUMN delivery_address VARCHAR(255) NULL COMMENT '收件地址/自提点' AFTER delivery_method"
        );
    }

    private void ensureDeliveryCodeColumn() {
        addColumnIfMissing(
                "delivery_configs",
                "code",
                "ALTER TABLE delivery_configs ADD COLUMN code VARCHAR(50) NULL COMMENT '配送方式编码' AFTER name"
        );
    }

    private void backfillUserUid() {
        jdbcTemplate.update(
                """
                UPDATE print_orders p
                LEFT JOIN sys_accounts a ON a.phone = p.user_phone
                SET p.user_uid = a.uid
                WHERE p.user_uid IS NULL
                """
        );
    }

    private void backfillDeliveryCodes() {
        jdbcTemplate.update(
                """
                UPDATE delivery_configs
                SET code = CASE
                    WHEN name = '标准快递' THEN 'standard'
                    WHEN name = '极速达' THEN 'express'
                    WHEN name = '自提' THEN 'pickup'
                    WHEN code IS NULL OR TRIM(code) = '' THEN CONCAT('delivery_', id)
                    ELSE code
                END
                WHERE code IS NULL OR TRIM(code) = ''
                """
        );
    }

    private void addColumnIfMissing(String tableName, String columnName, String alterSql) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        if (count != null && count == 0) {
            jdbcTemplate.execute(alterSql);
        }
    }
}
