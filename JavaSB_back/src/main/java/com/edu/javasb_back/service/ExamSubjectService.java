package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamSubject;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface ExamSubjectService {
    Result<Map<String, Object>> getSubjectList(String classId);

    Result<Void> addSubject(ExamSubject examSubject);

    Result<Void> deleteSubject(String id);

    Result<String> uploadSubjectFile(String subjectId, String type, MultipartFile file);
}
