package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.Map;

public interface ExamAnalysisService {
    Result<Map<String, Object>> getAnalysisProjectList(String name);

    Result<Map<String, Object>> getProjectDashboard(String projectId);

    Result<Map<String, Object>> getClassSelectData(String projectId);

    Result<Map<String, Object>> getClassDashboard(String projectId, String classId);

    Result<Map<String, Object>> getStudentReport(String projectId, String classId, String studentNo);

    Result<Map<String, Object>> getStudentSubjectReport(String projectId, String classId, String studentNo, String subjectName);
}
