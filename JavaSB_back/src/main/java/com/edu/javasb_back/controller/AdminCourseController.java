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

import com.edu.javasb_back.model.entity.CourseEpisode;
import com.edu.javasb_back.model.entity.CourseVideo;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import com.edu.javasb_back.config.GlobalConfigProperties;

/**
 * 后台管理端：课程管理控制器
 */
@RestController
@RequestMapping("/api/system/course")
public class AdminCourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

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

    @LogOperation("管理端：获取课程章节列表")
    @GetMapping("/episode/list")
    public Result<List<CourseEpisode>> getEpisodeList(@RequestParam String courseId) {
        return courseService.getCourseEpisodes(courseId);
    }

    @LogOperation("管理端：新增课程章节")
    @PostMapping("/episode/add")
    public Result<Void> addEpisode(@RequestBody CourseEpisode episode) {
        return courseService.addEpisode(episode);
    }

    @LogOperation("管理端：更新课程章节")
    @PutMapping("/episode/update")
    public Result<Void> updateEpisode(@RequestBody CourseEpisode episode) {
        return courseService.updateEpisode(episode);
    }

    @LogOperation("管理端：删除课程章节")
    @DeleteMapping("/episode/delete/{id}")
    public Result<Void> deleteEpisode(@PathVariable String id) {
        return courseService.deleteEpisode(id);
    }

    @LogOperation("管理端：获取章节视频列表")
    @GetMapping("/video/list")
    public Result<List<CourseVideo>> getVideoList(@RequestParam String episodeId) {
        return courseService.getEpisodeVideos(episodeId);
    }

    @LogOperation("管理端：新增章节视频")
    @PostMapping("/video/add")
    public Result<Void> addVideo(@RequestBody CourseVideo video) {
        return courseService.addVideo(video);
    }

    @LogOperation("管理端：更新章节视频")
    @PutMapping("/video/update")
    public Result<Void> updateVideo(@RequestBody CourseVideo video) {
        return courseService.updateVideo(video);
    }

    @LogOperation("管理端：删除章节视频")
    @DeleteMapping("/video/delete/{id}")
    public Result<Void> deleteVideo(@PathVariable String id) {
        return courseService.deleteVideo(id);
    }

    @LogOperation("管理端 : 上传课程封面")
    @PostMapping("/upload-cover")
    public Result<String> uploadCover(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + suffix;
        
        File destDir = new File(globalConfigProperties.getCourseCoverDir());
        if (!destDir.exists()) destDir.mkdirs();
        
        try {
            file.transferTo(new File(destDir.getAbsolutePath() + File.separator + fileName));
            return Result.success("上传成功", "/uploads/course/cover/" + fileName);
        } catch (IOException e) {
            return Result.error("上传失败 : " + e.getMessage());
        }
    }

    @LogOperation("管理端 : 上传课程视频")
    @PostMapping("/upload-video")
    public Result<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + suffix;
        
        File destDir = new File(globalConfigProperties.getCourseVideoDir());
        if (!destDir.exists()) destDir.mkdirs();
        
        try {
            file.transferTo(new File(destDir.getAbsolutePath() + File.separator + fileName));
            return Result.success("上传成功", "/uploads/course/video/" + fileName);
        } catch (IOException e) {
            return Result.error("上传失败 : " + e.getMessage());
        }
    }
}
