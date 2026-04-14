package com.edu.javasb_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edu.javasb_back.model.entity.SysRoleMenu;

@Repository
public interface SysRoleMenuRepository extends JpaRepository<SysRoleMenu, Long> {

    List<SysRoleMenu> findByRoleId(Integer roleId);

    void deleteByRoleId(Integer roleId);
}
