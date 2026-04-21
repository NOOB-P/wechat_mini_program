package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 小程序端试卷报告接口
 */
@RestController
@RequestMapping("/api/app/paper")
public class AppExamPaperController {

    @Autowired
    private ScoreService scoreService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @LogOperation("获取试卷报告详情")
    @GetMapping("/detail")
    public Result<Map<String, Object>> getPaperDetail(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String subject) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return scoreService.getPaperDetail(uid, examId, subject);
    }
}
