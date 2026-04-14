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
        ensureSourceTypeColumn();
        backfillSourceType();
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
