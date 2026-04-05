package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.service.ExamProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    @LogOperation("新增考试项目")
    @PostMapping("/add")
    public Result<Void> addProject(@RequestBody ExamProject project) {
        return examProjectService.addProject(project);
    }

    @LogOperation("更新考试项目")
    @PutMapping("/edit")
    public Result<Void> updateProject(@RequestBody ExamProject project) {
        return examProjectService.updateProject(project);
    }

    @LogOperation("删除考试项目")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteProject(@PathVariable String id) {
        return examProjectService.deleteProject(id);
    }
}