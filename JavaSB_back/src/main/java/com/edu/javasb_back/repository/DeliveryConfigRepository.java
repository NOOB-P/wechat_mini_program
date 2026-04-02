package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.DeliveryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 配送费用配置仓库
 */
@Repository
public interface DeliveryConfigRepository extends JpaRepository<DeliveryConfig, Long> {
}
