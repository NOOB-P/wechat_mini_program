package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.service.OrganizationImportService;
import com.edu.javasb_back.service.SysStudentService;
import com.edu.javasb_back.util.TemplateDownloadUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class SysStudentController {

    @Autowired
    private SysStudentService sysStudentService;

    @Autowired
    private com.edu.javasb_back.repository.SysStudentRepository sysStudentRepository;

    @Autowired
    private OrganizationImportService organizationImportService;

    @PostMapping("/import")
    public Result<Void> importStudents(@RequestParam("file") MultipartFile file,
                                       @RequestParam(value = "schoolId", required = false) String schoolId,
                                       @RequestParam(value = "classId", required = false) String classId) {
        try {
            return organizationImportService.importStudentStructure(file, schoolId, classId);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导入失败：" + e.getMessage());
        }
    }

    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        return TemplateDownloadUtils.buildDownloadResponse(
                List.of("static/resource/学生导入模板.zip", "templates/学生导入模板.zip"),
                "学生导入模板.zip"
        );
    }

    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return sysStudentService.getStudentList(page, size, keyword, schoolId, classId);
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
        Result<Void> result = sysStudentService.deleteStudent(id);
        // 如果失败，强制返回 200 code 并在 msg 里携带提示，或者使用特定的 code 让前端拦截器不阻断
        if (result.getCode() != 200) {
            return Result.success(result.getMsg(), null); // 返回 success 让前端能够拿到 msg 并弹窗警告
        }
        return result;
    }

    @GetMapping("/bound-parents/{id}")
    public Result<java.util.List<String>> getBoundParents(@PathVariable String id) {
        return sysStudentService.getBoundParents(id);
    }

    @PostMapping("/batch-delete")
    public Result<String> batchDeleteStudents(@RequestBody Map<String, java.util.List<String>> params) {
        java.util.List<String> ids = params.get("ids");
        if (ids == null || ids.isEmpty()) {
            return Result.error("未选中任何学生");
        }
        int successCount = 0;
        int failCount = 0;
        java.util.List<String> failedNames = new java.util.ArrayList<>();
        
        for (String id : ids) {
            String studentName = "未知学生";
            java.util.Optional<SysStudent> studentOpt = sysStudentRepository.findById(id);
            if (studentOpt.isPresent()) {
                studentName = studentOpt.get().getName();
            }
            
            Result<Void> result = sysStudentService.deleteStudent(id);
            if (result.getCode() == 200) {
                successCount++;
            } else {
                failCount++;
                failedNames.add(studentName);
            }
        }
        if (failCount > 0) {
            String failedMsg = String.join("，", failedNames);
            String detailMsg = "批量删除完成。成功 " + successCount + " 个，跳过 " + failCount + " 个存在绑定账号的学生。未能删除的学生：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }
}
