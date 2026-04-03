package com.edu.javasb_back.service;

import java.util.List;
import java.util.Map;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;

public interface CourseService {
    Result<List<Course>> getGeneralCourseList();
    Result<Course> getCourseDetail(Long uid, String courseId);
    Result<List<Course>> getSyncCourseList(String subject, String grade);
    Result<List<Course>> getFamilyEduList();
    Result<List<Course>> getStudentTalkList();
    Result<Map<String, List<Map<String, Object>>>> getSyncCourseOptions();
    
    // 用户交互
    Result<Void> collectCourse(Long uid, String courseId, boolean isCollect);
    Result<Void> recordLearning(Long uid, String courseId, Integer progress);
    
    // 我的模块
    Result<List<Course>> getMyCourses(Long uid);
    Result<List<Course>> getMyCollections(Long uid);
    Result<List<Map<String, Object>>> getMyStudyRecords(Long uid);

    // 管理端接口
    Result<List<Course>> getAllCourses(String type, Boolean isSvipOnly, Boolean isFree, Integer isRecommend);
    Result<Void> addCourse(Course course);
    Result<Void> updateCourse(Course course);
    Result<Void> deleteCourse(String id);
    Result<Void> changeStatus(String id, Integer status);
}
