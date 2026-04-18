package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.StudentExamAiReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentExamAiReportRepository extends JpaRepository<StudentExamAiReport, String> {
    Optional<StudentExamAiReport> findByProjectIdAndStudentNo(String projectId, String studentNo);
}
