package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;

import java.util.List;
import java.util.Map;

public interface SysStudentService {
    Result<Map<String, Object>> getStudentList(int page, int size, String keyword, String schoolId, String classId);

    Result<List<String>> getGrades(String schoolId);

    Result<List<String>> getClasses(String schoolId, String grade);

    Result<List<SysStudent>> getStudents(String schoolId, String grade, String className);
    
    Result<Void> addStudent(SysStudent student);
    
    Result<Void> updateStudent(SysStudent student);
    
    Result<Void> deleteStudent(String id);

    Result<String> batchDeleteStudents(List<String> ids);

    Result<Void> importStudents(java.util.List<com.edu.javasb_back.model.dto.StudentImportDTO> students);

    Result<java.util.List<String>> getBoundParents(String studentId);
}
