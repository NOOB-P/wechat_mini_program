package com.edu.javasb_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edu.javasb_back.model.entity.SysUserModule;

@Repository
public interface SysUserModuleRepository extends JpaRepository<SysUserModule, Long> {
    List<SysUserModule> findByUid(Long uid);
    void deleteByUid(Long uid);
}
