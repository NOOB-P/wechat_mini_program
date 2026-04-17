package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VipConfigRepository extends JpaRepository<VipConfig, Integer> {
    List<VipConfig> findAllByOrderBySortOrderAsc();
    List<VipConfig> findByIsEnabledOrderBySortOrderAsc(Integer isEnabled);
}
