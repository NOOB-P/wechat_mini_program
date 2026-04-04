package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.service.SysSchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @LogOperation("下载学校导入模板")
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

    @LogOperation("获取学校架构树")
    @GetMapping("/tree")
    public Result<List<SchoolNodeVO>> getSchoolTree() {
        return sysSchoolService.getSchoolTree();
    }

    @LogOperation("获取学校列表")
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

    @LogOperation("新增学校")
    @PostMapping("/add")
    public Result<Void> addSchool(@RequestBody SysSchool school) {
        return sysSchoolService.addSchool(school);
    }

    @LogOperation("更新学校")
    @PutMapping("/edit")
    public Result<Void> updateSchool(@RequestBody SysSchool school) {
        return sysSchoolService.updateSchool(school);
    }

    @LogOperation("删除学校")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSchool(@PathVariable String id) {
        return sysSchoolService.deleteSchool(id);
    }
}