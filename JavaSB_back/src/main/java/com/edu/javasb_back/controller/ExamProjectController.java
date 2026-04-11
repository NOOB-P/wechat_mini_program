package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import com.edu.javasb_back.service.ExamProjectService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/system/exam-project")
public class ExamProjectController {

    @Autowired
    private ExamProjectService examProjectService;

    @LogOperation("获取考试项目列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getProjectList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name) {
        return examProjectService.getProjectList(current, size, name);
    }

    @LogOperation("获取考试项目创建配置")
    @GetMapping("/options")
    public Result<Map<String, Object>> getProjectOptions() {
        return examProjectService.getProjectOptions();
    }

    @LogOperation("新增考试项目")
    @PostMapping("/add")
    public Result<Void> addProject(@RequestBody ExamProjectSaveDTO project) {
        return examProjectService.addProject(project);
    }

    @LogOperation("更新考试项目")
    @PutMapping("/edit")
    public Result<Void> updateProject(@RequestBody ExamProjectSaveDTO project) {
        return examProjectService.updateProject(project);
    }

    @LogOperation("删除考试项目")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteProject(@PathVariable String id) {
        return examProjectService.deleteProject(id);
    }

    @LogOperation("获取考试项目详情")
    @GetMapping("/detail/{id}")
    public Result<Map<String, Object>> getProjectDetail(@PathVariable String id) {
        return examProjectService.getProjectDetail(id);
    }

    @LogOperation("获取考试项目考生列表")
    @GetMapping("/students")
    public Result<Map<String, Object>> getProjectStudents(
            @RequestParam String projectId,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return examProjectService.getProjectStudentPage(projectId, current, size, keyword, schoolId, classId);
    }

    @LogOperation("获取考试项目成绩概览")
    @GetMapping("/scores/summary")
    public Result<Map<String, Object>> getProjectScoreSummary(@RequestParam String projectId) {
        return examProjectService.getProjectScoreSummary(projectId);
    }

    @LogOperation("获取考试项目成绩列表")
    @GetMapping("/scores/list")
    public Result<Map<String, Object>> getProjectScoreList(
            @RequestParam String projectId,
            @RequestParam(required = false) String subjectName,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return examProjectService.getProjectScorePage(
                projectId,
                subjectName,
                current,
                size,
                keyword,
                schoolId,
                classId
        );
    }

    @LogOperation("下载成绩导入模板")
    @GetMapping("/scores/template")
    public void downloadScoreTemplate(HttpServletResponse response) {
        examProjectService.downloadScoreTemplate(response);
    }

    @LogOperation("导入成绩")
    @PostMapping("/scores/import")
    public Result<Void> importScores(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam MultipartFile file) {
        return examProjectService.importScores(projectId, subjectName, file);
    }

    @LogOperation("批量导入试卷")
    @PostMapping("/papers/import")
    public Result<Void> importAnswerSheets(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam MultipartFile file) {
        return examProjectService.importAnswerSheets(projectId, subjectName, file);
    }

    @LogOperation("上传单个试卷")
    @PostMapping("/papers/upload")
    public Result<String> uploadAnswerSheet(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam String studentNo,
            @RequestParam MultipartFile file) {
        return examProjectService.uploadAnswerSheet(projectId, subjectName, studentNo, file);
    }
}
