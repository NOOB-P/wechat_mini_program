package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.Map;

public interface ScoreAiReportService {
    Result<Map<String, Object>> getExamAiReport(Long uid, String examId, boolean refresh);

    Result<String> exportExamAiReport(Long uid, String examId);
}
