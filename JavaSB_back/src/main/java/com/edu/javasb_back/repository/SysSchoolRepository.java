package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysSchoolRepository extends JpaRepository<SysSchool, Long>, JpaSpecificationExecutor<SysSchool> {
    List<SysSchool> findByStatus(Integer status);
    
    java.util.Optional<SysSchool> findByProvinceAndCityAndName(String province, String city, String name);

    java.util.Optional<SysSchool> findBySchoolId(String schoolId);
}