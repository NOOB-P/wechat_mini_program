package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SysClassRepository extends JpaRepository<SysClass, Long>, JpaSpecificationExecutor<SysClass> {
    Optional<SysClass> findByClassid(String classid);
    List<SysClass> findByClassidIn(List<String> classIds);
    boolean existsByClassid(String classid);
    Optional<SysClass> findFirstBySchoolIdAndGradeAndAlias(String schoolId, String grade, String alias);
    java.util.List<SysClass> findBySchoolId(String schoolId);
    java.util.List<SysClass> findBySchoolIdIn(List<String> schoolIds);
}
