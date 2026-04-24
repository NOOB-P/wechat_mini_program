package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamStudentScore;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamStudentScoreRepository extends JpaRepository<ExamStudentScore, Long> {
    List<ExamStudentScore> findBySubjectIdIn(List<String> subjectIds);

    java.util.Optional<ExamStudentScore> findBySubjectIdAndStudentNo(String subjectId, String studentNo);

    List<ExamStudentScore> findByStudentNo(String studentNo);
}
