package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamProject;
import java.util.Map;

public interface ExamProjectService {
    Result<Map<String, Object>> getProjectList(int current, int size, String name);
    Result<Void> addProject(ExamProject project);
    Result<Void> updateProject(ExamProject project);
    Result<Void> deleteProject(String id);
}