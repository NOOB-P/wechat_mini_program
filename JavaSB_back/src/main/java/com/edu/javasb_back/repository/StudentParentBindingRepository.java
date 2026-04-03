package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.StudentParentBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentParentBindingRepository extends JpaRepository<StudentParentBinding, Long> {
    List<StudentParentBinding> findByStudentId(String studentId);
    List<StudentParentBinding> findByParentUid(Long parentUid);
    Optional<StudentParentBinding> findByStudentIdAndParentUid(String studentId, Long parentUid);
    long countByStudentId(String studentId);
}
