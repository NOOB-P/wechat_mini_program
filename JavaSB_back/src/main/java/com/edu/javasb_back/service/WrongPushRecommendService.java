package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.Map;

public interface WrongPushRecommendService {
    Result<Map<String, Object>> recommendWrongQuestion(Long uid, String examId, String subject, String questionNo, Integer count);
}
