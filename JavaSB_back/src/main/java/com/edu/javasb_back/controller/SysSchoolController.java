package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.service.SysSchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/school")
public class SysSchoolController {

    @Autowired
    private SysSchoolService sysSchoolService;

    @LogOperation("获取学校架构树")
    @GetMapping("/tree")
    public Result<List<SchoolNodeVO>> getSchoolTree() {
        return sysSchoolService.getSchoolTree();
    }

    @LogOperation("获取学校列表")
    @GetMapping("/list")
    public Result<List<SysSchool>> getSchoolList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name) {
        return sysSchoolService.getSchoolList(keyword, province, city, name);
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