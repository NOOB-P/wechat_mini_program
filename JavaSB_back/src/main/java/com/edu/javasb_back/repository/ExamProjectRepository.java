package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamProjectRepository extends JpaRepository<ExamProject, String>, JpaSpecificationExecutor<ExamProject> {
}