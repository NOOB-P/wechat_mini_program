package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamClass;
import java.util.Map;

public interface ExamClassService {
    Result<Map<String, Object>> getClassList(int current, int size, String projectId, String school, String grade, String className);
    Result<Void> addClass(ExamClass examClass);
    Result<Void> updateClass(ExamClass examClass);
    Result<Void> deleteClass(String id);
}