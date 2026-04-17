package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface PaperService {
    Page<ExamPaper> getPaperList(String keyword, String subject, String grade, String type, Boolean isRecommend, Pageable pageable);

    Result<Map<String, Object>> getAdminPaperList(String keyword, String subject, String grade, String type, Boolean isRecommend, int pageNum, int pageSize);

    Result<List<ExamPaper>> getAppPaperList(String keyword, String subject, String grade, String type, Boolean isRecommend, int pageNum, int pageSize);

    ExamPaper savePaper(ExamPaper paper);

    void deletePaper(Long id);

    ExamPaper getPaperById(Long id);

    void incrementDownloadCount(Long id);

    List<Map<String, Object>> getTypeStatistics();

    List<Map<String, Object>> getGradeStatistics(String type);

    List<Map<String, Object>> getSubjectStatistics(String type, String grade);

    List<PaperSubject> getAllSubjects();

    PaperSubject saveSubject(PaperSubject subject);

    void deleteSubject(Long id);
}
