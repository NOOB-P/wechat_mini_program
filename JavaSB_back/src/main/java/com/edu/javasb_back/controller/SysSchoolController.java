package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.service.SysSchoolService;
import com.edu.javasb_back.listener.SchoolImportListener;
import com.edu.javasb_back.model.dto.SchoolImportDTO;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system/school")
public class SysSchoolController {

    @Autowired
    private SysSchoolService sysSchoolService;

    @PostMapping("/import")
    public Result<Void> importSchools(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("文件内容为空");
        }

        try {
            SchoolImportListener listener = new SchoolImportListener();
            EasyExcel.read(file.getInputStream(), SchoolImportDTO.class, listener).sheet().doRead();
            return sysSchoolService.importSchools(listener.getList());
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
            // 指向 assets 目录下的学校导入模板
            File file = new File("JavaSB_back/src/main/assests/学校导入模板.xlsx");
            if (!file.exists()) {
                // 尝试另一种相对路径
                file = new File("src/main/assests/学校导入模板.xlsx");
            }
            if (!file.exists()) {
                // 尝试绝对路径
                file = new File("c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/学校导入模板.xlsx");
            }
            if (!file.exists()) {
                // 回退机制：如果都没找到，尝试在当前工作目录下寻找
                file = new File("src/main/assests/学校导入模板.xlsx");
            }
            
            if (!file.exists()) {
                System.out.println("找不到模板文件: " + file.getAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String filename = URLEncoder.encode("学校导入模板.xlsx", StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tree")
    public Result<List<SchoolNodeVO>> getSchoolTree() {
        return sysSchoolService.getSchoolTree();
    }

    @GetMapping("/list")
    public Result<Map<String, Object>> getSchoolList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name) {
        return sysSchoolService.getSchoolList(current, size, keyword, province, city, name);
    }

    @PostMapping("/add")
    public Result<Void> addSchool(@RequestBody SysSchool school) {
        return sysSchoolService.addSchool(school);
    }

    @PutMapping("/edit")
    public Result<Void> updateSchool(@RequestBody SysSchool school) {
        return sysSchoolService.updateSchool(school);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSchool(@PathVariable Long id) {
        return sysSchoolService.deleteSchool(id);
    }

    @PostMapping("/batch-delete")
    public Result<String> batchDeleteSchools(@RequestBody Map<String, java.util.List<Long>> params) {
        java.util.List<Long> ids = params.get("ids");
        if (ids == null || ids.isEmpty()) {
            return Result.error("未选中任何学校");
        }
        int successCount = 0;
        int failCount = 0;
        java.util.List<String> failedNames = new java.util.ArrayList<>();
        
        for (Long id : ids) {
            java.util.Optional<SysSchool> schoolOpt = sysSchoolService.getSchoolById(id); // assuming we need to get name, or fetch in service
            String schoolName = "未知学校";
            if (schoolOpt.isPresent()) {
                schoolName = schoolOpt.get().getName();
            }
            
            Result<Void> result = sysSchoolService.deleteSchool(id);
            if (result.getCode() == 200) {
                successCount++;
            } else {
                failCount++;
                failedNames.add(schoolName);
            }
        }
        if (failCount > 0) {
            String failedMsg = String.join("，", failedNames);
            String detailMsg = "批量删除完成。成功 " + successCount + " 个，跳过 " + failCount + " 个存在绑定数据的学校。未能删除的学校：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }
}