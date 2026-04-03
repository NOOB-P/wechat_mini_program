package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    
    @Query(value = "SELECT * FROM exam_results WHERE student_no = :studentNo AND exam_id = :examId", nativeQuery = true)
    Optional<ExamResult> findByStudentNoAndExamId(@Param("studentNo") String studentNo, @Param("examId") String examId);

    @Query(value = "SELECT * FROM exam_results WHERE student_no = :studentNo ORDER BY create_time DESC LIMIT 6", nativeQuery = true)
    List<ExamResult> findTop6ByStudentNoOrderByCreateTimeDesc(@Param("studentNo") String studentNo);
}
