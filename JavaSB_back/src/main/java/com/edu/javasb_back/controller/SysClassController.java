package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.service.SysClassService;
import com.edu.javasb_back.listener.ClassImportListener;
import com.edu.javasb_back.model.dto.ClassImportDTO;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.exception.ExcelAnalysisException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/system/class")
public class SysClassController {

    @Autowired
    private SysClassService sysClassService;

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

    @PostMapping("/add")
    public Result<?> createClass(@RequestBody SysClass sysClass) {
        try {
            return sysClassService.createClass(sysClass);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

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
            return Result.error(500, "批量添加失败：" + e.getMessage());
        }
    }

    @PostMapping("/import")
    public Result<Void> importClasses(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("文件内容为空");
        }
        try {
            ClassImportListener listener = new ClassImportListener();
            EasyExcel.read(file.getInputStream(), ClassImportDTO.class, listener).sheet().doRead();
            return sysClassService.importClasses(listener.getList());
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
            File file = new File("JavaSB_back/src/main/assests/学校-班级模板.xlsx");
            if (!file.exists()) {
                file = new File("src/main/assests/学校-班级模板.xlsx");
            }
            if (!file.exists()) {
                file = new File("c:/Users/31585/Desktop/wechat_mini_program/JavaSB_back/src/main/assests/学校-班级模板.xlsx");
            }
            if (!file.exists()) {
                System.out.println("找不到模板文件: " + file.getAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String filename = URLEncoder.encode("学校-班级模板.xlsx", StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/update/{id}")
    public Result<?> updateClass(@PathVariable Long id, @RequestBody SysClass sysClass) {
        try {
            SysClass updated = sysClassService.updateClass(id, sysClass);
            return Result.success(updated);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public Result<?> deleteClass(@PathVariable Long id) {
        try {
            sysClassService.deleteClass(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

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
                com.edu.javasb_back.model.entity.SysClass sysClass = sysClassService.getClassById(id);
                if (sysClass != null) {
                    className = sysClass.getGrade() + sysClass.getAlias();
                }
            } catch (Exception e) {
                // ignore
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
            String detailMsg = "批量删除完成。成功 " + successCount + " 个，跳过 " + failCount + " 个存在绑定数据的班级。未能删除的班级：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }

    @GetMapping("/{id}")
    public Result<?> getClassById(@PathVariable Long id) {
        try {
            return Result.success(sysClassService.getClassById(id));
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }
}
