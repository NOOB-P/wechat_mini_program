package com.edu.javasb_back.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.service.OrganizationImportService;
import com.edu.javasb_back.service.SysClassService;
import com.edu.javasb_back.util.TemplateDownloadUtils;

@RestController
@RequestMapping("/api/system/class")
public class SysClassController {

    @Autowired
    private SysClassService sysClassService;

    @Autowired
    private OrganizationImportService organizationImportService;

    @PreAuthorize("hasAnyAuthority('system:class:list','system:student:list','exam:project:list')")
    @GetMapping("/list")
    public Result<?> getClasses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String classid,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String schoolId) {
        Page<SysClass> pageResult = sysClassService.getClasses(page, size, classid, grade, schoolId);
        Map<String, Object> data = new HashMap<>();
        data.put("records", pageResult.getContent());
        data.put("total", pageResult.getTotalElements());
        return Result.success(data);
    }

    @PreAuthorize("hasAnyAuthority('system:class:list','system:student:list','exam:project:list')")
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> getClassOptions(@RequestParam String schoolId) {
        List<SysClass> classes = sysClassService.getClasses(1, 1000, null, null, schoolId).getContent();
        List<Map<String, Object>> options = classes.stream().map(sysClass -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sysClass.getClassid());
            map.put("name", sysClass.getAlias());
            map.put("grade", sysClass.getGrade());
            return map;
        }).collect(Collectors.toList());
        return Result.success(options);
    }

    @PreAuthorize("hasAuthority('system:class:add')")
    @PostMapping("/add")
    public Result<?> createClass(@RequestBody SysClass sysClass) {
        try {
            return sysClassService.createClass(sysClass);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:class:batch-add')")
    @PostMapping("/batch-add")
    public Result<?> batchAddClasses(@RequestBody Map<String, Object> request) {
        try {
            String schoolId = (String) request.get("schoolId");
            String grade = (String) request.get("grade");
            String format = (String) request.get("format");
            int classStart = Integer.parseInt(request.get("classStart").toString());
            int classEnd = Integer.parseInt(request.get("classEnd").toString());
            return sysClassService.batchAddClasses(schoolId, grade, format, classStart, classEnd);
        } catch (Exception e) {
            return Result.error(500, "批量添加失败: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:class:import')")
    @PostMapping("/import")
    public Result<Void> importClasses(@RequestParam("file") MultipartFile file,
                                      @RequestParam(value = "schoolId", required = false) String schoolId) {
        try {
            return organizationImportService.importClassStructure(file, schoolId);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导入失败: " + e.getMessage());
        }
    }
    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        return TemplateDownloadUtils.buildDownloadResponse(
                List.of("static/resource/班级导入模板.zip", "templates/班级导入模板.zip"),
                "班级导入模板.zip"
        );
    }

    @PreAuthorize("hasAuthority('system:class:edit')")
    @PutMapping("/update/{id}")
    public Result<?> updateClass(@PathVariable Long id, @RequestBody SysClass sysClass) {
        try {
            SysClass updated = sysClassService.updateClass(id, sysClass);
            return Result.success(updated);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:class:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<?> deleteClass(@PathVariable Long id,
                                 @RequestParam(defaultValue = "false") boolean cascade) {
        try {
            sysClassService.deleteClass(id, cascade);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:class:delete')")
    @PostMapping("/batch-delete")
    public Result<String> batchDeleteClasses(@RequestBody Map<String, List<Long>> params) {
        List<Long> ids = params.get("ids");
        if (ids == null || ids.isEmpty()) {
            return Result.error("未选中任何班级");
        }
        int successCount = 0;
        int failCount = 0;
        java.util.List<String> failedNames = new java.util.ArrayList<>();
        for (Long id : ids) {
            String className = "未知班级";
            try {
                SysClass sysClass = sysClassService.getClassById(id);
                if (sysClass != null) {
                    className = sysClass.getGrade() + sysClass.getAlias();
                }
            } catch (Exception ignored) {
            }
            try {
                sysClassService.deleteClass(id);
                successCount++;
            } catch (Exception e) {
                failCount++;
                failedNames.add(className);
            }
        }
        if (failCount > 0) {
            String failedMsg = String.join("，", failedNames);
            String detailMsg = "批量删除完成。成功 " + successCount + " 个，跳过 " + failCount
                    + " 个存在绑定数据的班级。未能删除的班级：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }

    @PreAuthorize("hasAnyAuthority('system:class:detail','exam:project:list')")
    @GetMapping("/{id}")
    public Result<?> getClassById(@PathVariable Long id) {
        try {
            return Result.success(sysClassService.getClassById(id));
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }
}
