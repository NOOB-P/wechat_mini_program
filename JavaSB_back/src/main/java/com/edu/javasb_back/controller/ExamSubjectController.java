package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.service.ExamSubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/system/exam-subject")
public class ExamSubjectController {

    @Autowired
    private ExamSubjectService examSubjectService;

    @LogOperation("获取考试科目列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getSubjectList(@RequestParam String classId) {
        return examSubjectService.getSubjectList(classId);
    }

    @LogOperation("新增考试科目")
    @PostMapping("/add")
    public Result<Void> addSubject(@RequestBody ExamSubject examSubject) {
        return examSubjectService.addSubject(examSubject);
    }

    @LogOperation("删除考试科目")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSubject(@PathVariable String id) {
        return examSubjectService.deleteSubject(id);
    }

    @LogOperation("上传考试科目试卷文件")
    @PostMapping("/upload")
    public Result<String> uploadSubjectFile(
            @RequestParam String subjectId,
            @RequestParam String type,
            @RequestParam MultipartFile file) {
        return examSubjectService.uploadSubjectFile(subjectId, type, file);
    }
}
