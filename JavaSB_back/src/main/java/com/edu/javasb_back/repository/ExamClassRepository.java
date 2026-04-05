package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamClassRepository extends JpaRepository<ExamClass, String>, JpaSpecificationExecutor<ExamClass> {
}