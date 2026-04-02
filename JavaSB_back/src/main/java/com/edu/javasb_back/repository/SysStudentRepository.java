package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysStudent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SysStudentRepository extends JpaRepository<SysStudent, String>, JpaSpecificationExecutor<SysStudent> {
    Optional<SysStudent> findByStudentNo(String studentNo);
}