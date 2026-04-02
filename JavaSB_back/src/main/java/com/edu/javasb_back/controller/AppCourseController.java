package com.edu.javasb_back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.service.CourseService;

@RestController
@RequestMapping("/api/app")
public class AppCourseController {

    @Autowired
    private CourseService courseService;

    // 辅助方法：获取当前用户的 UID
    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @LogOperation("获取常规课程列表")
    @GetMapping("/course/list")
    public Result<List<Course>> getCourseList() {
        return courseService.getGeneralCourseList();
    }

    @LogOperation("获取课程详情")
    @GetMapping("/course/detail")
    public Result<Course> getCourseDetail(@RequestParam("id") String id) {
        return courseService.getCourseDetail(getCurrentUid(), id);
    }

    @LogOperation("获取同步课程列表")
    @GetMapping("/resource/sync-course/list")
    public Result<List<Course>> getSyncCourseList(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "grade", required = false) String grade) {
        return courseService.getSyncCourseList(subject, grade);
    }

    @LogOperation("获取家庭教育列表")
    @GetMapping("/resource/family-edu/list")
    public Result<List<Course>> getFamilyEduList() {
        return courseService.getFamilyEduList();
    }

    @LogOperation("获取同步课程筛选选项")
    @GetMapping("/resource/sync-course/options")
    public Result<Map<String, List<Map<String, Object>>>> getSyncCourseOptions() {
        return courseService.getSyncCourseOptions();
    }

    @LogOperation("收藏/取消收藏课程")
    @PostMapping("/course/collect")
    public Result<Void> collectCourse(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        String courseId = (String) params.get("courseId");
        Boolean isCollect = (Boolean) params.get("isCollect");
        return courseService.collectCourse(uid, courseId, isCollect);
    }

    @LogOperation("记录学习进度")
    @PostMapping("/course/learn")
    public Result<Void> recordLearning(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        String courseId = (String) params.get("courseId");
        Integer progress = (Integer) params.get("progress");
        return courseService.recordLearning(uid, courseId, progress != null ? progress : 0);
    }

    @LogOperation("获取我的课程")
    @GetMapping("/mine/course/list")
    public Result<List<Course>> getMyCourses() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return courseService.getMyCourses(uid);
    }

    @LogOperation("获取我的收藏")
    @GetMapping("/mine/collection/list")
    public Result<List<Course>> getMyCollections() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return courseService.getMyCollections(uid);
    }

    @LogOperation("获取学习记录")
    @GetMapping("/mine/record/list")
    public Result<List<Map<String, Object>>> getMyStudyRecords() {
        Long uid = getCurrentUid();
        if (uid == null) return Result.error(401, "请先登录");
        return courseService.getMyStudyRecords(uid);
    }
}
