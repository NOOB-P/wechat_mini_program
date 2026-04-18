package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysStudent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface SysStudentRepository extends JpaRepository<SysStudent, String>, JpaSpecificationExecutor<SysStudent> {
    Optional<SysStudent> findByStudentNo(String studentNo);

    @Query("SELECT DISTINCT s.grade FROM SysStudent s WHERE s.schoolId = :schoolId")
    List<String> findDistinctGrades(@Param("schoolId") String schoolId);

    @Query("SELECT DISTINCT s.className FROM SysStudent s WHERE s.schoolId = :schoolId AND s.grade = :grade")
    List<String> findDistinctClasses(@Param("schoolId") String schoolId, @Param("grade") String grade);

    @Query("SELECT s FROM SysStudent s WHERE s.schoolId = :schoolId AND s.grade = :grade AND s.className = :className")
    List<SysStudent> findBySchoolIdAndGradeAndClassName(@Param("schoolId") String schoolId, @Param("grade") String grade, @Param("className") String className);

    List<SysStudent> findBySchoolId(String schoolId);

    List<SysStudent> findByClassId(String classId);

    List<SysStudent> findByClassIdIn(List<String> classIds);
}
