package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.PaperPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 纸张单价配置仓库
 */
@Repository
public interface PaperPriceRepository extends JpaRepository<PaperPrice, Long> {
}
