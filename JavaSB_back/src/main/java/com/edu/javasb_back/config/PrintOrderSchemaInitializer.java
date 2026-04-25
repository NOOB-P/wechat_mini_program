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
        backfillUserUid();
    }

    private void ensureUserUidColumn() {
        addColumnIfMissing(
                "print_orders",
                "user_uid",
                "ALTER TABLE print_orders ADD COLUMN user_uid BIGINT NULL COMMENT '下单用户UID' AFTER order_no"
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
