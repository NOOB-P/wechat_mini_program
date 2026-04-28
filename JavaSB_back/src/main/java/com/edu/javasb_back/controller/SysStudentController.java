package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.service.OrganizationImportService;
import com.edu.javasb_back.service.SysStudentService;
import com.edu.javasb_back.utils.TemplateDownloadUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private OrganizationImportService organizationImportService;

    @PreAuthorize("hasAuthority('system:student:import')")
    @PostMapping("/import")
    public Result<Void> importStudents(@RequestParam("file") MultipartFile file,
                                       @RequestParam(value = "schoolId", required = false) String schoolId,
                                       @RequestParam(value = "classId", required = false) String classId) {
        try {
            return organizationImportService.importStudentStructure(file, schoolId, classId);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:student:import')")
    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        return TemplateDownloadUtils.buildDownloadResponse(
                List.of("static/resource/瀛︾敓瀵煎叆妯℃澘.zip", "templates/瀛︾敓瀵煎叆妯℃澘.zip"),
                "瀛︾敓瀵煎叆妯℃澘.zip"
        );
    }

    @PreAuthorize("hasAuthority('system:student:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getStudentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return sysStudentService.getStudentList(page, size, keyword, schoolId, classId);
    }

    @PreAuthorize("hasAuthority('system:student:add')")
    @PostMapping("/add")
    public Result<Void> addStudent(@RequestBody SysStudent student) {
        return sysStudentService.addStudent(student);
    }

    @PreAuthorize("hasAuthority('system:student:edit')")
    @PutMapping("/edit")
    public Result<Void> updateStudent(@RequestBody SysStudent student) {
        return sysStudentService.updateStudent(student);
    }

    @PreAuthorize("hasAuthority('system:student:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteStudent(@PathVariable String id) {
        Result<Void> result = sysStudentService.deleteStudent(id);
        if (result.getCode() != 200) {
            return Result.success(result.getMsg(), null);
        }
        return result;
    }

    @PreAuthorize("hasAuthority('system:student:bound-parents')")
    @GetMapping("/bound-parents/{id}")
    public Result<List<String>> getBoundParents(@PathVariable String id) {
        return sysStudentService.getBoundParents(id);
    }

    @PreAuthorize("hasAuthority('system:student:delete')")
    @PostMapping("/batch-delete")
    public Result<String> batchDeleteStudents(@RequestBody Map<String, List<String>> params) {
        return sysStudentService.batchDeleteStudents(params.get("ids"));
    }
}
