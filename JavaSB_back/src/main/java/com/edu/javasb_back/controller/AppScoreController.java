package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.WrongPushRecommendRequest;
import com.edu.javasb_back.service.ScoreAiReportService;
import com.edu.javasb_back.service.ScoreService;
import com.edu.javasb_back.service.WrongPushRecommendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @Autowired
    private WrongPushRecommendService wrongPushRecommendService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @LogOperation("获取学期考试列表")
    @GetMapping("/semester/list")
    public Result<Map<String, Object>> getSemesterList() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getSemesterList(uid);
    }

    @LogOperation("获取学生成绩详情")
    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentScores(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getStudentScores(uid, semester, examId);
    }

    @LogOperation("获取成绩构成分析")
    @GetMapping("/composition")
    public Result<Map<String, Object>> getScoreComposition(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String subject) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreComposition(uid, examId, subject);
    }

    @LogOperation("获取分数分布统计")
    @GetMapping("/distribution")
    public Result<Map<String, Object>> getScoreDistribution(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String subject) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreDistribution(uid, examId, subject);
    }

    @LogOperation("获取近六次考试趋势")
    @GetMapping("/trend")
    public Result<Map<String, Object>> getScoreTrend(@RequestParam(required = false) String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreService.getScoreTrend(uid, examId);
    }

    @LogOperation("获取考试AI成绩报告")
    @GetMapping("/ai-report")
    public Result<Map<String, Object>> getExamAiReport(@RequestParam String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreAiReportService.getExamAiReport(uid, examId);
    }

    @LogOperation("获取错题举一反三推荐")
    @PostMapping("/wrong-push/recommend")
    public Result<Map<String, Object>> recommendWrongQuestion(@RequestBody WrongPushRecommendRequest request) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return wrongPushRecommendService.recommendWrongQuestion(
                uid,
                request == null ? null : request.getExamId(),
                request == null ? null : request.getSubject(),
                request == null ? null : request.getQuestionNo(),
                request == null ? null : request.getCount()
        );
    }

    /**
     * 导出考试 AI 成绩报告 PDF
     */
    @LogOperation("导出AI成绩报告")
    @GetMapping("/ai-report/export")
    public Result<String> exportExamAiReport(@RequestParam String examId) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return scoreAiReportService.exportExamAiReport(uid, examId);
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
