package com.edu.javasb_back.controller;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseEpisode;
import com.edu.javasb_back.model.entity.CourseVideo;
import com.edu.javasb_back.service.CourseService;
import com.edu.javasb_back.service.OssStorageService;

/**
 * 后台管理端：课程管理控制器
 */
@RestController
@RequestMapping("/api/system/course")
public class AdminCourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private OssStorageService ossStorageService;

    @LogOperation("管理端：获取课程列表")
    @PreAuthorize("hasAuthority('course:manage:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getCourseList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isSvipOnly,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) Integer isRecommend) {
        if (!StringUtils.hasText(type)) {
            type = null;
        }
        return courseService.getAllCoursesPaged(current, size, type, isSvipOnly, isFree, isRecommend);
    }

    @LogOperation("管理端：新增课程")
    @PreAuthorize("hasAuthority('course:manage:add')")
    @PostMapping("/add")
    public Result<Void> addCourse(@RequestBody Course course) {
        return courseService.addCourse(course);
    }

    @LogOperation("管理端：更新课程")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PutMapping("/update")
    public Result<Void> updateCourse(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    @LogOperation("管理端：删除课程")
    @PreAuthorize("hasAuthority('course:manage:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCourse(@PathVariable String id) {
        return courseService.deleteCourse(id);
    }

    @LogOperation("管理端：修改课程状态")
    @PreAuthorize("hasAuthority('course:manage:status')")
    @PostMapping("/status")
    public Result<Void> changeStatus(@RequestBody Map<String, Object> params) {
        String id = (String) params.get("id");
        Integer status = (Integer) params.get("status");
        return courseService.changeStatus(id, status);
    }

    @LogOperation("管理端：获取课程章节列表")
    @PreAuthorize("hasAuthority('course:manage:list')")
    @GetMapping("/episode/list")
    public Result<List<CourseEpisode>> getEpisodeList(@RequestParam String courseId) {
        return courseService.getCourseEpisodes(courseId);
    }

    @LogOperation("管理端：新增课程章节")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/episode/add")
    public Result<Void> addEpisode(@RequestBody CourseEpisode episode) {
        return courseService.addEpisode(episode);
    }

    @LogOperation("管理端：更新课程章节")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PutMapping("/episode/update")
    public Result<Void> updateEpisode(@RequestBody CourseEpisode episode) {
        return courseService.updateEpisode(episode);
    }

    @LogOperation("管理端：删除课程章节")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @DeleteMapping("/episode/delete/{id}")
    public Result<Void> deleteEpisode(@PathVariable String id) {
        return courseService.deleteEpisode(id);
    }

    @LogOperation("管理端：获取章节视频列表")
    @PreAuthorize("hasAuthority('course:manage:list')")
    @GetMapping("/video/list")
    public Result<List<CourseVideo>> getVideoList(@RequestParam String episodeId) {
        return courseService.getEpisodeVideos(episodeId);
    }

    @LogOperation("管理端：新增章节视频")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/video/add")
    public Result<Void> addVideo(@RequestBody CourseVideo video) {
        return courseService.addVideo(video);
    }

    @LogOperation("管理端：更新章节视频")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PutMapping("/video/update")
    public Result<Void> updateVideo(@RequestBody CourseVideo video) {
        return courseService.updateVideo(video);
    }

    @LogOperation("管理端：删除章节视频")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @DeleteMapping("/video/delete/{id}")
    public Result<Void> deleteVideo(@PathVariable String id) {
        return courseService.deleteVideo(id);
    }

    @LogOperation("管理端 : 上传课程封面")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/upload-cover")
    public Result<String> uploadCover(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + suffix;

        try {
            return Result.success("上传成功", ossStorageService.upload(file, "course/cover/" + fileName));
        } catch (IOException e) {
            return Result.error("上传失败 : " + e.getMessage());
        }
    }

    @LogOperation("管理端 : 上传课程视频")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/upload-video")
    public Result<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + suffix;

        try {
            return Result.success("上传成功", ossStorageService.upload(file, "course/video/" + fileName));
        } catch (IOException e) {
            return Result.error("上传失败 : " + e.getMessage());
        }
    }

    @LogOperation("管理端 : 获取课程视频直传签名")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/upload-video-signature")
    public Result<Map<String, Object>> createVideoUploadSignature(@RequestBody Map<String, Object> params) {
        String fileName = params.get("fileName") == null ? null : String.valueOf(params.get("fileName"));
        String contentType = params.get("contentType") == null ? null : String.valueOf(params.get("contentType"));
        if (fileName == null || fileName.isBlank()) {
            return Result.error("文件名不能为空");
        }
        String suffix = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : "";
        if (!".mp4".equals(suffix)) {
            return Result.error("仅支持 MP4 格式");
        }

        String objectKey = "course/video/" + UUID.randomUUID() + suffix;
        try {
            OssStorageService.DirectUploadToken token = ossStorageService.createPutUploadToken(
                    objectKey,
                    contentType,
                    10 * 60 * 1000L
            );
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("signedUrl", token.signedUrl());
            data.put("publicUrl", token.publicUrl());
            data.put("objectKey", token.objectKey());
            data.put("expireAt", token.expireAt());
            return Result.success("获取上传签名成功", data);
        } catch (IOException e) {
            return Result.error("生成上传签名失败 : " + e.getMessage());
        }
    }
}
