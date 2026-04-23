package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.ScoreAiReportService;
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

    @Autowired
    private ScoreAiReportService scoreAiReportService;

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

    /**
     * 获取成绩构成分析
     */
    @LogOperation("获取成绩构成分析")
    @GetMapping("/composition")
    public Result<Map<String, Object>> getScoreComposition(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String subject) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreComposition(uid, examId, subject);
    }

    /**
     * 获取分数分布统计
     */
    @LogOperation("获取分数分布统计")
    @GetMapping("/distribution")
    public Result<Map<String, Object>> getScoreDistribution(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String subject) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreDistribution(uid, examId, subject);
    }

    /**
     * 获取近六次考试趋势
     */
    @LogOperation("获取近六次考试趋势")
    @GetMapping("/trend")
    public Result<Map<String, Object>> getScoreTrend(@RequestParam(required = false) String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreTrend(uid, examId);
    }

    /**
     * 获取考试 AI 成绩报告
     */
    @LogOperation("获取考试AI成绩报告")
    @GetMapping("/ai-report")
    public Result<Map<String, Object>> getExamAiReport(@RequestParam String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreAiReportService.getExamAiReport(uid, examId);
    }

    /**
     * 导出错题集 PDF
     */
    @LogOperation("导出错题集")
    @GetMapping("/wrong-book/export")
    public Result<String> exportWrongBook(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false, defaultValue = "all") String subject) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.exportWrongBook(uid, examId, subject);
    }
}
