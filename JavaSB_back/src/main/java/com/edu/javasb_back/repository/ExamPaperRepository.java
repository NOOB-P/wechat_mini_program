package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamPaperRepository extends JpaRepository<ExamPaper, Long>, JpaSpecificationExecutor<ExamPaper> {
    List<ExamPaper> findByIsRecommendTrue();
    List<ExamPaper> findBySubject(String subject);
    List<ExamPaper> findByType(String type);
}
