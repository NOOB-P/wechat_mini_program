package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubjectRepository extends JpaRepository<ExamSubject, String> {
    List<ExamSubject> findByClassIdIn(List<String> classIds);
    List<ExamSubject> findByClassIdInOrderBySubjectNameAsc(List<String> classIds);
    List<ExamSubject> findByClassId(String classId);
    List<ExamSubject> findByClassIdOrderBySubjectNameAsc(String classId);
    Optional<ExamSubject> findFirstByClassIdAndSubjectName(String classId, String subjectName);
}
