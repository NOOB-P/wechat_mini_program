package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VipPricingRepository extends JpaRepository<VipPricing, Integer> {
    List<VipPricing> findByVipIdOrderBySortOrderAsc(Integer vipId);
}
