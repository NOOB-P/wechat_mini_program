package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VipConfigRepository extends JpaRepository<VipConfig, Integer> {
    List<VipConfig> findAllByOrderBySortOrderAsc();
    List<VipConfig> findByIsEnabledOrderBySortOrderAsc(Integer isEnabled);
    Optional<VipConfig> findByTypeValue(Integer typeValue);
}
