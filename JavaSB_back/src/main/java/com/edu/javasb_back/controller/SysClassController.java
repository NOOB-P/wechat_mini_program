package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.service.SysClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
            @RequestParam(required = false) String grade) {
        
        Page<SysClass> pageResult = sysClassService.getClasses(page, size, classid, grade);
        Map<String, Object> data = new HashMap<>();
        data.put("records", pageResult.getContent());
        data.put("total", pageResult.getTotalElements());
        
        return Result.success(data);
    }

    @PostMapping("/add")
    public Result<?> createClass(@RequestBody SysClass sysClass) {
        try {
            SysClass created = sysClassService.createClass(sysClass);
            return Result.success(created);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
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

    @GetMapping("/{id}")
    public Result<?> getClassById(@PathVariable Long id) {
        try {
            return Result.success(sysClassService.getClassById(id));
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }
}
