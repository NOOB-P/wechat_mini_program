package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;

import java.util.Map;

public interface SysStudentService {
    Result<Map<String, Object>> getStudentList(int page, int size, String name, String studentNo, String schoolId);
    
    Result<Void> addStudent(SysStudent student);
    
    Result<Void> updateStudent(SysStudent student);
    
    Result<Void> deleteStudent(String id);
}