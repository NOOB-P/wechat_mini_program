package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipConfigSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VipConfigSchoolRepository extends JpaRepository<VipConfigSchool, Long> {
    List<VipConfigSchool> findByVipConfigId(Integer vipId);
}
