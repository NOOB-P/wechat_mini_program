package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.service.SysSchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public Result<List<SysSchool>> getSchoolList() {
        return sysSchoolService.getSchoolList();
    }

    @LogOperation("新增学校")
    @PostMapping("/add")
    public Result<Void> addSchool(@RequestBody SysSchool school) {
        return sysSchoolService.addSchool(school);
    }
}