package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import java.util.Map;

public interface ExamProjectService {
    Result<Map<String, Object>> getProjectList(int current, int size, String name);
    Result<Map<String, Object>> getProjectOptions();
    Result<Void> addProject(ExamProjectSaveDTO project);
    Result<Void> updateProject(ExamProjectSaveDTO project);
    Result<Void> deleteProject(String id);
    Result<Map<String, Object>> getProjectDetail(String id);
    Result<Map<String, Object>> getProjectStudentPage(
            String projectId,
            int current,
            int size,
            String keyword,
            String schoolId,
            String classId);
    Result<Map<String, Object>> getProjectScoreSummary(String projectId);
    Result<Map<String, Object>> getProjectScorePage(
            String projectId,
            String subjectName,
            int current,
            int size,
            String keyword,
            String schoolId,
            String classId);
}
