package com.edu.javasb_back.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseEpisode;
import com.edu.javasb_back.model.entity.CourseVideo;
import com.edu.javasb_back.repository.CourseEpisodeRepository;
import com.edu.javasb_back.repository.CourseInteractionRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.repository.CourseVideoRepository;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.CourseService;
import com.edu.javasb_back.service.OssStorageService;

@Service
@Transactional(readOnly = true)
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

    @Autowired
    private OssStorageService ossStorageService;

    @Override
    public Result<List<Course>> getGeneralCourseList() {
        return Result.success(normalizeCourses(courseRepository.findAllGeneralCoursesSql()));
    }

    @Override
    @Transactional
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
                normalizeEpisodeMedia(episode);
            }
            course.setEpisodeList(episodes);
            normalizeCourseMedia(course);
            return Result.success(course);
        }
        return Result.error("课程不存在");
    }

    @Override
    public Result<List<Course>> getSyncCourseList(String subject, String grade) {
        return Result.success(normalizeCourses(courseRepository.findSyncCoursesSql(subject, grade)));
    }

    @Override
    public Result<List<Course>> getFamilyEduList(Long uid, String keyword, String filter) {
        String normalizedKeyword = normalizeKeyword(keyword);
        if ("purchased".equals(filter)) {
            if (uid == null) return Result.error(401, "请先登录");
            return Result.success(normalizeCourses(courseRepository.findPurchasedCoursesByTypeSql(uid, "family", normalizedKeyword)));
        }
        Boolean isFree = null;
        if ("free".equals(filter)) isFree = true;
        else if ("paid".equals(filter)) isFree = false;
        
        return Result.success(normalizeCourses(courseRepository.findFamilyEduListSql(normalizedKeyword, isFree)));
    }

    @Override
    public Result<List<Course>> getStudentTalkList(Long uid, String keyword, String filter) {
        String normalizedKeyword = normalizeKeyword(keyword);
        if ("purchased".equals(filter)) {
            if (uid == null) return Result.error(401, "请先登录");
            return Result.success(normalizeCourses(courseRepository.findPurchasedCoursesByTypeSql(uid, "talk", normalizedKeyword)));
        }
        Boolean isFree = null;
        if ("free".equals(filter)) isFree = true;
        else if ("paid".equals(filter)) isFree = false;
        
        return Result.success(normalizeCourses(courseRepository.findStudentTalkListSql(normalizedKeyword, isFree)));
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
    }

    @Override
    public Result<Map<String, List<Map<String, Object>>>> getSyncCourseOptions() {
        Map<String, List<Map<String, Object>>> options = new HashMap<>();
        options.put("grades", courseRepository.findSyncGradeOptionsSql());
        options.put("subjects", courseRepository.findSyncSubjectOptionsSql());
        return Result.success(options);
    }

    @Override
    @Transactional
    public Result<Void> collectCourse(Long uid, String courseId, boolean isCollect) {
        if (isCollect) {
            interactionRepository.addCollectionSql(uid, courseId);
        } else {
            interactionRepository.removeCollectionSql(uid, courseId);
        }
        return Result.success("操作成功", null);
    }

    @Override
    @Transactional
    public Result<Void> recordLearning(Long uid, String courseId, Integer progress) {
        interactionRepository.recordStudyRecordSql(uid, courseId, progress);
        return Result.success("学习记录已更新", null);
    }

    @Override
    public Result<List<Course>> getMyCourses(Long uid) {
        return Result.success(normalizeCourses(courseRepository.findMyCoursesSql(uid)));
    }

    @Override
    public Result<List<Course>> getMyCollections(Long uid) {
        return Result.success(normalizeCourses(courseRepository.findMyCollectionsSql(uid)));
    }

    @Override
    public Result<List<Map<String, Object>>> getMyStudyRecords(Long uid) {
        List<Map<String, Object>> records = courseRepository.findStudyRecordsSql(uid);
        for (Map<String, Object> item : records) {
            Object cover = item.get("cover");
            if (cover instanceof String coverUrl) {
                item.put("cover", normalizeMediaUrl(coverUrl));
            }
        }
        return Result.success(records);
    }

    @Override
    public Result<List<Course>> getAllCourses(String type, Boolean isSvipOnly, Boolean isFree, Integer isRecommend) {
        return Result.success(normalizeCourses(courseRepository.findAllCoursesFilteredSql(type, isSvipOnly, isFree, isRecommend)));
    }

    @Override
    @Transactional
    public Result<Void> addCourse(Course course) {
        if (course.getId() == null || course.getId().isEmpty()) {
            course.setId("CRS" + System.currentTimeMillis());
        }
        course.setCover(normalizeMediaUrl(course.getCover()));
        course.setVideoUrl(normalizeMediaUrl(course.getVideoUrl()));
        courseRepository.save(course);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> updateCourse(Course course) {
        if (course.getId() == null || !courseRepository.existsById(course.getId())) {
            return Result.error("课程不存在");
        }
        course.setCover(normalizeMediaUrl(course.getCover()));
        course.setVideoUrl(normalizeMediaUrl(course.getVideoUrl()));
        courseRepository.save(course);
        return Result.success("更新成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteCourse(String id) {
        courseRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @Override
    @Transactional
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
        List<CourseEpisode> episodes = episodeRepository.findByCourseIdOrderBySortOrderAscCreateTimeAsc(courseId);
        episodes.forEach(this::normalizeEpisodeMedia);
        return Result.success(episodes);
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
        List<CourseVideo> videos = videoRepository.findByEpisodeIdOrderBySortOrderAscCreateTimeAsc(episodeId);
        videos.forEach(this::normalizeVideoMedia);
        return Result.success(videos);
    }

    @Override
    @Transactional
    public Result<Void> addVideo(CourseVideo video) {
        if (video.getId() == null || video.getId().isEmpty()) {
            video.setId("VID" + System.currentTimeMillis());
        }
        video.setCreateTime(LocalDateTime.now());
        video.setUpdateTime(LocalDateTime.now());
        video.setVideoUrl(normalizeMediaUrl(video.getVideoUrl()));
        
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
        
        video.setVideoUrl(normalizeMediaUrl(video.getVideoUrl()));
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

    private List<Course> normalizeCourses(List<Course> courses) {
        courses.forEach(this::normalizeCourseMedia);
        return courses;
    }

    private void normalizeCourseMedia(Course course) {
        if (course == null) {
            return;
        }
        course.setCover(normalizeMediaUrl(course.getCover()));
        course.setVideoUrl(normalizeMediaUrl(course.getVideoUrl()));
        if (course.getEpisodeList() != null) {
            course.getEpisodeList().forEach(this::normalizeEpisodeMedia);
        }
    }

    private void normalizeEpisodeMedia(CourseEpisode episode) {
        if (episode == null || episode.getVideoList() == null) {
            return;
        }
        episode.getVideoList().forEach(this::normalizeVideoMedia);
    }

    private void normalizeVideoMedia(CourseVideo video) {
        if (video == null) {
            return;
        }
        video.setVideoUrl(normalizeMediaUrl(video.getVideoUrl()));
    }

    private String normalizeMediaUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return url;
        }
        String objectKey = ossStorageService.extractObjectKey(url);
        if (StringUtils.hasText(objectKey)) {
            return ossStorageService.buildUrl(objectKey);
        }
        return url.trim();
    }
}
