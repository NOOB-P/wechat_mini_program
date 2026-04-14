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
import com.edu.javasb_back.service.CourseOrderService;

import com.edu.javasb_back.model.entity.CourseEpisode;
import com.edu.javasb_back.model.entity.CourseVideo;
import com.edu.javasb_back.repository.CourseEpisodeRepository;
import com.edu.javasb_back.repository.CourseVideoRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEpisodeRepository episodeRepository;

    @Autowired
    private CourseInteractionRepository interactionRepository;

    @Autowired
    private CourseVideoRepository videoRepository;

    @Autowired
    private CourseOrderService orderService;

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
                // 检查是否已购买
                course.setIsPurchased(orderService.isCoursePurchased(uid, courseId));
            }
            // 获取章节列表
            List<CourseEpisode> episodes = episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId);
            for (CourseEpisode episode : episodes) {
                episode.setVideoList(videoRepository.findByEpisodeIdOrderBySortOrderAscCreateTimeAsc(episode.getId()));
            }
            course.setEpisodeList(episodes);
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

    @Override
    public Result<List<CourseEpisode>> getCourseEpisodes(String courseId) {
        return Result.success(episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId));
    }

    @Override
    @Transactional
    public Result<Void> addEpisode(CourseEpisode episode) {
        if (episode.getId() == null || episode.getId().isEmpty()) {
            episode.setId("EP" + System.currentTimeMillis());
        }
        episode.setCreateTime(LocalDateTime.now());
        
        // 优化排序：处理冲突并递增
        optimizeEpisodeSort(episode.getCourseId(), episode.getSortOrder(), null);
        
        episodeRepository.save(episode);
        
        // 归一化排序：确保序号连续
        normalizeEpisodeSort(episode.getCourseId());
        
        // 更新课程总节数
        updateCourseEpisodeCount(episode.getCourseId());
        
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> updateEpisode(CourseEpisode episode) {
        Optional<CourseEpisode> oldOpt = episodeRepository.findById(episode.getId());
        if (oldOpt.isEmpty()) {
            return Result.error("章节不存在");
        }
        
        // 如果排序发生了变化，处理冲突
        if (!oldOpt.get().getSortOrder().equals(episode.getSortOrder())) {
            optimizeEpisodeSort(episode.getCourseId(), episode.getSortOrder(), episode.getId());
        }
        
        episodeRepository.save(episode);
        
        // 归一化排序：确保序号连续
        normalizeEpisodeSort(episode.getCourseId());
        
        return Result.success("更新成功", null);
    }

    /**
     * 优化章节排序逻辑：如果出现相同排序，则该排序及之后的章节全部序号+1
     */
    private void optimizeEpisodeSort(String courseId, Integer targetSort, String excludeId) {
        List<CourseEpisode> list = episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId);
        int currentSort = targetSort;
        for (CourseEpisode ep : list) {
            if (excludeId != null && ep.getId().equals(excludeId)) continue;
            
            if (ep.getSortOrder() >= currentSort) {
                ep.setSortOrder(ep.getSortOrder() + 1);
                episodeRepository.save(ep);
            }
        }
    }

    /**
     * 归一化章节排序逻辑：确保序号从1开始且连续
     */
    private void normalizeEpisodeSort(String courseId) {
        List<CourseEpisode> list = episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId);
        for (int i = 0; i < list.size(); i++) {
            CourseEpisode ep = list.get(i);
            int newSort = i + 1;
            if (ep.getSortOrder() != newSort) {
                ep.setSortOrder(newSort);
                episodeRepository.save(ep);
            }
        }
    }

    @Override
    @Transactional
    public Result<Void> deleteEpisode(String id) {
        Optional<CourseEpisode> epOpt = episodeRepository.findById(id);
        if (epOpt.isPresent()) {
            String courseId = epOpt.get().getCourseId();
            episodeRepository.deleteById(id);
            
            // 归一化排序：确保序号连续
            normalizeEpisodeSort(courseId);
            
            // 更新课程总节数
            updateCourseEpisodeCount(courseId);
            return Result.success("删除成功", null);
        }
        return Result.error("章节不存在");
    }

    private void updateCourseEpisodeCount(String courseId) {
        List<CourseEpisode> episodes = episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId);
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setEpisodes(episodes.size());
            courseRepository.save(course);
        }
    }

    @Override
    public Result<List<CourseVideo>> getEpisodeVideos(String episodeId) {
        return Result.success(videoRepository.findByEpisodeIdOrderBySortOrderAscCreateTimeAsc(episodeId));
    }

    @Override
    @Transactional
    public Result<Void> addVideo(CourseVideo video) {
        if (video.getId() == null || video.getId().isEmpty()) {
            video.setId("VID" + System.currentTimeMillis());
        }
        video.setCreateTime(LocalDateTime.now());
        video.setUpdateTime(LocalDateTime.now());
        
        // 优化视频排序
        optimizeVideoSort(video.getEpisodeId(), video.getSortOrder(), null);
        
        videoRepository.save(video);
        
        // 归一化排序：确保序号连续
        normalizeVideoSort(video.getEpisodeId());
        
        return Result.success("添加视频成功", null);
    }

    @Override
    @Transactional
    public Result<Void> updateVideo(CourseVideo video) {
        Optional<CourseVideo> oldOpt = videoRepository.findById(video.getId());
        if (oldOpt.isEmpty()) {
            return Result.error("视频不存在");
        }
        
        if (!oldOpt.get().getSortOrder().equals(video.getSortOrder())) {
            optimizeVideoSort(video.getEpisodeId(), video.getSortOrder(), video.getId());
        }
        
        video.setUpdateTime(LocalDateTime.now());
        videoRepository.save(video);
        
        // 归一化排序：确保序号连续
        normalizeVideoSort(video.getEpisodeId());
        
        return Result.success("更新视频成功", null);
    }

    /**
     * 优化视频排序逻辑
     */
    private void optimizeVideoSort(String episodeId, Integer targetSort, String excludeId) {
        List<CourseVideo> list = videoRepository.findByEpisodeIdOrderBySortOrderAscCreateTimeAsc(episodeId);
        int currentSort = targetSort;
        for (CourseVideo v : list) {
            if (excludeId != null && v.getId().equals(excludeId)) continue;
            
            if (v.getSortOrder() >= currentSort) {
                v.setSortOrder(v.getSortOrder() + 1);
                videoRepository.save(v);
            }
        }
    }

    /**
     * 归一化视频排序逻辑
     */
    private void normalizeVideoSort(String episodeId) {
        List<CourseVideo> list = videoRepository.findByEpisodeIdOrderBySortOrderAscCreateTimeAsc(episodeId);
        for (int i = 0; i < list.size(); i++) {
            CourseVideo v = list.get(i);
            int newSort = i + 1;
            if (v.getSortOrder() != newSort) {
                v.setSortOrder(newSort);
                videoRepository.save(v);
            }
        }
    }

    @Override
    @Transactional
    public Result<Void> deleteVideo(String id) {
        Optional<CourseVideo> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            String episodeId = videoOpt.get().getEpisodeId();
            videoRepository.deleteById(id);
            
            // 归一化排序：确保序号连续
            normalizeVideoSort(episodeId);
            
            return Result.success("删除视频成功", null);
        }
        return Result.error("视频不存在");
    }
}
