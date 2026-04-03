package com.edu.javasb_back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.service.CourseService;

/**
 * 后台管理端：课程管理控制器
 */
@RestController
@RequestMapping("/api/system/course")
public class AdminCourseController {

    @Autowired
    private CourseService courseService;

    @LogOperation("管理端：获取课程列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getCourseList(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isSvipOnly,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) Integer isRecommend) {
        Result<List<Course>> result = courseService.getAllCourses(type, isSvipOnly, isFree, isRecommend);
        if (result.getCode() == 200) {
            List<Course> list = result.getData();
            return Result.success(Map.of(
                "list", list,
                "total", list.size()
            ));
        }
        return Result.error(result.getMsg());
    }

    @LogOperation("管理端：新增课程")
    @PostMapping("/add")
    public Result<Void> addCourse(@RequestBody Course course) {
        return courseService.addCourse(course);
    }

    @LogOperation("管理端：更新课程")
    @PutMapping("/update")
    public Result<Void> updateCourse(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    @LogOperation("管理端：删除课程")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCourse(@PathVariable String id) {
        return courseService.deleteCourse(id);
    }

    @LogOperation("管理端：修改课程状态")
    @PostMapping("/status")
    public Result<Void> changeStatus(@RequestBody Map<String, Object> params) {
        String id = (String) params.get("id");
        Integer status = (Integer) params.get("status");
        return courseService.changeStatus(id, status);
    }
}
