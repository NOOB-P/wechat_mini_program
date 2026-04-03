package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.service.SysStudentService;
import com.edu.javasb_back.listener.StudentImportListener;
import com.edu.javasb_back.model.dto.StudentImportDTO;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.exception.ExcelAnalysisException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class SysStudentController {

    @Autowired
    private SysStudentService sysStudentService;

    @LogOperation("导入学生档案")
    @PostMapping("/import")
    public Result<Void> importStudents(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("文件内容为空");
        }

        try {
            StudentImportListener listener = new StudentImportListener();
            EasyExcel.read(file.getInputStream(), StudentImportDTO.class, listener).sheet().doRead();
            sysStudentService.importStudents(listener.getList());
            return Result.success("导入成功", null);
        } catch (ExcelAnalysisException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导入失败：" + e.getMessage());
        }
    }

    @LogOperation("下载学生上传模板")
    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            // 使用相对于项目根目录的路径
            String filePath = "JavaSB_back/src/main/assests/学生上传模板.xlsx";
            File file = new File(filePath);
            if (!file.exists()) {
                // 尝试另一种可能的相对路径（如果是在子模块目录下运行）
                filePath = "src/main/assests/学生上传模板.xlsx";
                file = new File(filePath);
            }
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String filename = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @LogOperation("查询学生列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return sysStudentService.getStudentList(page, size, keyword);
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