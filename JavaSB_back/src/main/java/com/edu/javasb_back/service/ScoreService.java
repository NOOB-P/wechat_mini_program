package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import java.util.Map;

public interface ScoreService {
    /**
     * 获取学期及考试列表
     */
    Result<Map<String, Object>> getSemesterList(Long uid);

    /**
     * 获取学生成绩详情
     */
    Result<Map<String, Object>> getStudentScores(Long uid, String semester, String examId);
}
