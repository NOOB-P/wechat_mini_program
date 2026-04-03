package com.edu.javasb_back.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.repository.CourseInteractionRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.service.CourseService;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseInteractionRepository interactionRepository;

    @Override
    public Result<List<Course>> getGeneralCourseList() {
        return Result.success(courseRepository.findAllGeneralCoursesSql());
    }

    @Override
    public Result<Course> getCourseDetail(Long uid, String courseId) {
        Optional<Course> courseOpt = courseRepository.findByIdSql(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            // 记录“我的课程” (最近查看)
            if (uid != null) {
                interactionRepository.recordMyCourseSql(uid, courseId);
                // 检查是否已收藏
                int count = interactionRepository.checkIsCollectedSql(uid, courseId);
                course.setIsCollected(count > 0);
            }
            return Result.success(course);
        }
        return Result.error("课程不存在");
    }

    @Override
    public Result<List<Course>> getSyncCourseList(String subject, String grade) {
        return Result.success(courseRepository.findSyncCoursesSql(subject, grade));
    }

    @Override
    public Result<List<Course>> getFamilyEduList() {
        return Result.success(courseRepository.findFamilyEduListSql());
    }

    @Override
    public Result<List<Course>> getStudentTalkList() {
        return Result.success(courseRepository.findStudentTalkListSql());
    }

    @Override
    public Result<Map<String, List<Map<String, Object>>>> getSyncCourseOptions() {
        Map<String, List<Map<String, Object>>> options = new HashMap<>();
        options.put("grades", courseRepository.findSyncGradeOptionsSql());
        options.put("subjects", courseRepository.findSyncSubjectOptionsSql());
        return Result.success(options);
    }

    @Override
    public Result<Void> collectCourse(Long uid, String courseId, boolean isCollect) {
        if (isCollect) {
            interactionRepository.addCollectionSql(uid, courseId);
        } else {
            interactionRepository.removeCollectionSql(uid, courseId);
        }
        return Result.success("操作成功", null);
    }

    @Override
    public Result<Void> recordLearning(Long uid, String courseId, Integer progress) {
        interactionRepository.recordStudyRecordSql(uid, courseId, progress);
        return Result.success("学习记录已更新", null);
    }

    @Override
    public Result<List<Course>> getMyCourses(Long uid) {
        return Result.success(courseRepository.findMyCoursesSql(uid));
    }

    @Override
    public Result<List<Course>> getMyCollections(Long uid) {
        return Result.success(courseRepository.findMyCollectionsSql(uid));
    }

    @Override
    public Result<List<Map<String, Object>>> getMyStudyRecords(Long uid) {
        return Result.success(courseRepository.findStudyRecordsSql(uid));
    }

    @Override
    public Result<List<Course>> getAllCourses(String type, Boolean isSvipOnly, Boolean isFree, Integer isRecommend) {
        return Result.success(courseRepository.findAllCoursesFilteredSql(type, isSvipOnly, isFree, isRecommend));
    }

    @Override
    public Result<Void> addCourse(Course course) {
        if (course.getId() == null || course.getId().isEmpty()) {
            course.setId("CRS" + System.currentTimeMillis());
        }
        courseRepository.save(course);
        return Result.success("添加成功", null);
    }

    @Override
    public Result<Void> updateCourse(Course course) {
        if (course.getId() == null || !courseRepository.existsById(course.getId())) {
            return Result.error("课程不存在");
        }
        courseRepository.save(course);
        return Result.success("更新成功", null);
    }

    @Override
    public Result<Void> deleteCourse(String id) {
        courseRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @Override
    public Result<Void> changeStatus(String id, Integer status) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setStatus(status);
            courseRepository.save(course);
            return Result.success("操作成功", null);
        }
        return Result.error("课程不存在");
    }
}
