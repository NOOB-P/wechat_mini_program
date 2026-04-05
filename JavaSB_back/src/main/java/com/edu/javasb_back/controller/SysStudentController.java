package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.service.SysStudentService;
import com.edu.javasb_back.listener.StudentImportListener;
import com.edu.javasb_back.model.dto.StudentImportDTO;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.exception.ExcelAnalysisException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
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

    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            // 优先尝试从类路径读取（支持打成 jar 包的情况）
            Resource resource = new ClassPathResource("templates/student_template.xlsx");
            
            // 如果类路径中不存在，或者为了兼容开发环境，尝试直接读取 assets 目录下的原文件
            if (!resource.exists()) {
                File file = new File("JavaSB_back/src/main/assests/学生上传模板.xlsx");
                if (!file.exists()) {
                    // 尝试另一种相对路径
                    file = new File("src/main/assests/学生上传模板.xlsx");
                }
                if (!file.exists()) {
                    // 尝试绝对路径
                    file = new File("c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/学生上传模板.xlsx");
                }
                
                if (file.exists()) {
                    resource = new FileSystemResource(file);
                }
            }

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String filename = URLEncoder.encode("学生上传模板.xlsx", StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return sysStudentService.getStudentList(page, size, keyword);
    }

    @PostMapping("/add")
    public Result<Void> addStudent(@RequestBody SysStudent student) {
        return sysStudentService.addStudent(student);
    }

    @PutMapping("/edit")
    public Result<Void> updateStudent(@RequestBody SysStudent student) {
        return sysStudentService.updateStudent(student);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteStudent(@PathVariable String id) {
        return sysStudentService.deleteStudent(id);
    }
}