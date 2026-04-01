package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysSchoolRepository extends JpaRepository<SysSchool, String> {
    List<SysSchool> findByStatus(Integer status);
}