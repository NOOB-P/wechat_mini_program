package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamQuestionXkwMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamQuestionXkwMappingRepository extends JpaRepository<ExamQuestionXkwMapping, Long> {
    Optional<ExamQuestionXkwMapping> findByExamIdAndSubjectAndQuestionNo(String examId, String subject, String questionNo);
}
