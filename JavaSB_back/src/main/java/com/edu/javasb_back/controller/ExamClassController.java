package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.service.ExamClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system/exam-class")
public class ExamClassController {

    @Autowired
    private ExamClassService examClassService;

    @LogOperation("获取考试班级列表")
    @PreAuthorize("hasAuthority('exam:class:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getClassList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = true) String projectId,
            @RequestParam(required = false) String school,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String className) {
        return examClassService.getClassList(current, size, projectId, school, grade, className);
    }

    @LogOperation("新增考试班级")
    @PreAuthorize("hasAuthority('exam:class:add')")
    @PostMapping("/add")
    public Result<Void> addClass(@RequestBody ExamClass examClass) {
        return examClassService.addClass(examClass);
    }

    @LogOperation("更新考试班级")
    @PreAuthorize("hasAuthority('exam:class:edit')")
    @PutMapping("/edit")
    public Result<Void> updateClass(@RequestBody ExamClass examClass) {
        return examClassService.updateClass(examClass);
    }

    @LogOperation("删除考试班级")
    @PreAuthorize("hasAuthority('exam:class:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteClass(@PathVariable String id) {
        return examClassService.deleteClass(id);
    }
}
