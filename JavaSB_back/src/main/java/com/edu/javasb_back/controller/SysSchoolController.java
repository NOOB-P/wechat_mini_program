package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.service.OrganizationImportService;
import com.edu.javasb_back.service.SysSchoolService;
import com.edu.javasb_back.util.TemplateDownloadUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/school")
public class SysSchoolController {

    @Autowired
    private SysSchoolService sysSchoolService;

    @Autowired
    private OrganizationImportService organizationImportService;

    @PreAuthorize("hasAuthority('system:school:import')")
    @PostMapping("/import")
    public Result<Void> importSchools(@RequestParam("file") MultipartFile file) {
        try {
            return organizationImportService.importSchoolStructure(file);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('system:school:import')")
    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadTemplate() {
        return TemplateDownloadUtils.buildDownloadResponse(
                List.of("static/resource/学校导入模板.zip", "templates/学校导入模板.zip"),
                "学校导入模板.zip"
        );
    }

    @PreAuthorize("hasAnyAuthority('system:school:list','system:class:list','system:student:list','exam:project:list')")
    @GetMapping("/tree")
    public Result<List<SchoolNodeVO>> getSchoolTree() {
        return sysSchoolService.getSchoolTree();
    }

    /**
     * 获取学校选项列表 (ID 和 名称)
     */
    @PreAuthorize("hasAnyAuthority('system:school:list','system:class:list','system:student:list','exam:project:list')")
    @GetMapping("/options")
    public Result<List<Map<String, Object>>> getSchoolOptions() {
        Object records = sysSchoolService.getSchoolList(1, 1000, null, null, null, null).getData().get("records");
        List<SysSchool> schools = records instanceof List<?> list
                ? list.stream().filter(SysSchool.class::isInstance).map(SysSchool.class::cast).toList()
                : List.of();

        List<Map<String, Object>> options = schools.stream().map(school -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", school.getSchoolId());
            map.put("name", school.getName());
            return map;
        }).collect(Collectors.toList());
        return Result.success(options);
    }

    @PreAuthorize("hasAuthority('system:school:list')")
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

    @PreAuthorize("hasAuthority('system:school:add')")
    @PostMapping("/add")
    public Result<Void> addSchool(@RequestBody SysSchool school) {
        return sysSchoolService.addSchool(school);
    }

    @PreAuthorize("hasAuthority('system:school:edit')")
    @PutMapping("/edit")
    public Result<Void> updateSchool(@RequestBody SysSchool school) {
        return sysSchoolService.updateSchool(school);
    }

    @PreAuthorize("hasAuthority('system:school:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSchool(@PathVariable Long id) {
        return sysSchoolService.deleteSchool(id);
    }

    @PreAuthorize("hasAuthority('system:school:delete')")
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
            java.util.Optional<SysSchool> schoolOpt = sysSchoolService.getSchoolById(id);
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
            String detailMsg = "批量删除完成。成功 " + successCount + " 个，跳过 " + failCount
                    + " 个存在绑定数据的学校。未能删除的学校：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }
}
