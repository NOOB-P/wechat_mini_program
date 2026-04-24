package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubjectRepository extends JpaRepository<ExamSubject, String> {
    List<ExamSubject> findByProjectId(String projectId);
    List<ExamSubject> findByProjectIdOrderBySubjectNameAsc(String projectId);
    List<ExamSubject> findByProjectIdIn(List<String> projectIds);
    List<ExamSubject> findByProjectIdInOrderBySubjectNameAsc(List<String> projectIds);
    Optional<ExamSubject> findFirstByProjectIdAndSubjectName(String projectId, String subjectName);
}
