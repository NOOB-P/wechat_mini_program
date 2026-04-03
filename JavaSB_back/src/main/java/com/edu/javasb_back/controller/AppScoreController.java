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
 * 小程序端成绩/学情分析控制器
 */
@RestController
@RequestMapping("/api/app/score")
public class AppScoreController {

    @Autowired
    private ScoreService scoreService;

    // 辅助方法：获取当前用户的 UID
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

    /**
     * 获取学期及考试列表
     */
    @LogOperation("获取学期考试列表")
    @GetMapping("/semester/list")
    public Result<Map<String, Object>> getSemesterList() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getSemesterList(uid);
    }

    /**
     * 获取学生成绩数据
     */
    @LogOperation("获取学生成绩详情")
    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentScores(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getStudentScores(uid, semester, examId);
    }
}
