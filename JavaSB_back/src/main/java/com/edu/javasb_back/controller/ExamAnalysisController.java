package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.ExamAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system/exam-analysis")
public class ExamAnalysisController {

    @Autowired
    private ExamAnalysisService examAnalysisService;

    @LogOperation("获取分析项目列表")
    @GetMapping("/projects")
    public Result<Map<String, Object>> getAnalysisProjectList(@RequestParam(required = false) String name) {
        return examAnalysisService.getAnalysisProjectList(name);
    }

    @LogOperation("获取项目分析大屏")
    @GetMapping("/project-dashboard")
    public Result<Map<String, Object>> getProjectDashboard(@RequestParam String projectId) {
        return examAnalysisService.getProjectDashboard(projectId);
    }

    @LogOperation("获取班级分析选择数据")
    @GetMapping("/class-select")
    public Result<Map<String, Object>> getClassSelectData(@RequestParam String projectId) {
        return examAnalysisService.getClassSelectData(projectId);
    }

    @LogOperation("获取班级分析大屏")
    @GetMapping("/class-dashboard")
    public Result<Map<String, Object>> getClassDashboard(@RequestParam String projectId, @RequestParam String classId) {
        return examAnalysisService.getClassDashboard(projectId, classId);
    }

    @LogOperation("获取单科报表")
    @GetMapping("/subject-report")
    public Result<Map<String, Object>> getSubjectReport(
            @RequestParam String projectId,
            @RequestParam(required = false) String subjectName) {
        return examAnalysisService.getSubjectReport(projectId, subjectName);
    }

    @LogOperation("获取学生分析报告")
    @GetMapping("/student-report")
    public Result<Map<String, Object>> getStudentReport(
            @RequestParam String projectId,
            @RequestParam String classId,
            @RequestParam String studentNo) {
        return examAnalysisService.getStudentReport(projectId, classId, studentNo);
    }

    @LogOperation("获取学生单科分析报告")
    @GetMapping("/student-subject-report")
    public Result<Map<String, Object>> getStudentSubjectReport(
            @RequestParam String projectId,
            @RequestParam String classId,
            @RequestParam String studentNo,
            @RequestParam String subjectName) {
        return examAnalysisService.getStudentSubjectReport(projectId, classId, studentNo, subjectName);
    }
}
