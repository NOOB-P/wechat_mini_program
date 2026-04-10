package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSubjectRepository extends JpaRepository<ExamSubject, String> {
    List<ExamSubject> findByClassIdIn(List<String> classIds);
    List<ExamSubject> findByClassIdInOrderBySubjectNameAsc(List<String> classIds);
    List<ExamSubject> findByClassId(String classId);
}
