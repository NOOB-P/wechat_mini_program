package com.edu.javasb_back.service;

import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;


public interface PaperService {
    // 试卷相关
    Page<ExamPaper> getPaperList(String keyword, String subject, String grade, String type, Boolean isRecommend, Pageable pageable);
    ExamPaper savePaper(ExamPaper paper);
    void deletePaper(Long id);
    ExamPaper getPaperById(Long id);
    void incrementDownloadCount(Long id);

    // 统计相关
    List<Map<String, Object>> getTypeStatistics();
    List<Map<String, Object>> getGradeStatistics(String type);
    List<Map<String, Object>> getSubjectStatistics(String type, String grade);

    // 科目相关
    List<PaperSubject> getAllSubjects();
    PaperSubject saveSubject(PaperSubject subject);
    void deleteSubject(Long id);
}
