package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import com.edu.javasb_back.model.dto.PaperLayoutSaveDTO;
import com.edu.javasb_back.model.dto.PaperOcrAutoCutDTO;
import com.edu.javasb_back.model.dto.PaperRegionOcrDTO;
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

    void downloadScoreTemplate(jakarta.servlet.http.HttpServletResponse response);

    Result<Map<String, Object>> importScores(String projectId, String subjectName, org.springframework.web.multipart.MultipartFile file);
    Result<Map<String, Object>> importAnswerSheets(String projectId, String subjectName, org.springframework.web.multipart.MultipartFile file);
    Result<String> uploadAnswerSheet(String projectId, String subjectName, String studentNo, org.springframework.web.multipart.MultipartFile file);
    
    /**
     * 上传公共试卷(样板/原卷)
     */
    Result<String> uploadPublicPaper(String projectId, String subjectName, String type, org.springframework.web.multipart.MultipartFile file);

    /**
     * 获取试卷配置
     */
    Result<java.util.Map<String, Object>> getPaperConfig(String projectId, String subjectName);

    /**
     * 保存试卷框选布局
     */
    Result<Void> savePaperLayout(PaperLayoutSaveDTO dto);

    /**
     * OCR 自动切割试卷题目区域
     */
    Result<Map<String, Object>> autoCutPaperLayoutByOcr(PaperOcrAutoCutDTO dto);

    /**
     * OCR 识别单页试卷并映射回长图坐标
     */
    Result<Map<String, Object>> ocrPaperLayoutPage(PaperOcrAutoCutDTO dto);

    /**
     * OCR 识别单个题框文本
     */
    Result<Map<String, Object>> ocrPaperRegion(PaperRegionOcrDTO dto);

    /**
     * 保存单个学生成绩
     */
    Result<Void> saveStudentScore(String projectId, String subjectName, String studentNo, java.util.List<Double> questionScores);
}
