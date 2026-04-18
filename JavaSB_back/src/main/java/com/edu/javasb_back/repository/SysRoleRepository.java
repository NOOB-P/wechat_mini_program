package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SysRoleRepository extends JpaRepository<SysRole, Integer> {
    Optional<SysRole> findByRoleCode(String roleCode);
    List<SysRole> findByRoleNameContaining(String roleName);
    Page<SysRole> findByRoleNameContaining(String roleName, Pageable pageable);
    List<SysRole> findByStatus(Integer status);
}
