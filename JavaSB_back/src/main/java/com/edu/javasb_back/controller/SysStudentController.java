package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.service.SysStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class SysStudentController {

    @Autowired
    private SysStudentService sysStudentService;

    @LogOperation("查询学生列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String studentNo,
            @RequestParam(required = false) String schoolId) {
        return sysStudentService.getStudentList(page, size, name, studentNo, schoolId);
    }

    @LogOperation("新增学生")
    @PostMapping("/add")
    public Result<Void> addStudent(@RequestBody SysStudent student) {
        return sysStudentService.addStudent(student);
    }

    @LogOperation("编辑学生")
    @PutMapping("/edit")
    public Result<Void> updateStudent(@RequestBody SysStudent student) {
        return sysStudentService.updateStudent(student);
    }

    @LogOperation("删除学生")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteStudent(@PathVariable String id) {
        return sysStudentService.deleteStudent(id);
    }
}