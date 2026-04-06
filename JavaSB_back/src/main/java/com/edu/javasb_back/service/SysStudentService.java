package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;

import java.util.Map;

public interface SysStudentService {
    Result<Map<String, Object>> getStudentList(int page, int size, String keyword, String schoolId, String classId);
    
    Result<Void> addStudent(SysStudent student);
    
    Result<Void> updateStudent(SysStudent student);
    
    Result<Void> deleteStudent(String id);

    Result<Void> importStudents(java.util.List<com.edu.javasb_back.model.dto.StudentImportDTO> students);

    Result<java.util.List<String>> getBoundParents(String studentId);
}