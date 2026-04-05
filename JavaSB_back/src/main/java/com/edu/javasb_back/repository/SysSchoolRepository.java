package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SysSchoolRepository extends JpaRepository<SysSchool, String>, JpaSpecificationExecutor<SysSchool> {
    List<SysSchool> findByStatus(Integer status);
    
    java.util.Optional<SysSchool> findByProvinceAndCityAndName(String province, String city, String name);

    @Query("SELECT DISTINCT s.province FROM SysSchool s WHERE s.status = 1")
    List<String> findDistinctProvinces();

    @Query("SELECT DISTINCT s.city FROM SysSchool s WHERE s.province = :province AND s.status = 1")
    List<String> findDistinctCities(@Param("province") String province);

    @Query("SELECT s FROM SysSchool s WHERE s.city = :city AND s.status = 1")
    List<SysSchool> findByCity(@Param("city") String city);
}