package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    
    @Query(value = "SELECT e.* FROM exams e " +
                   "JOIN exam_results er ON e.id = er.exam_id " +
                   "WHERE er.student_no = :studentNo " +
                   "ORDER BY e.exam_date DESC", nativeQuery = true)
    List<Exam> findExamsByStudentNo(@Param("studentNo") String studentNo);
}
