package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.CourseVideoDirectUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/oss")
public class OssController {

    @Autowired
    private CourseVideoDirectUploadService courseVideoDirectUploadService;

    @LogOperation("管理端：获取课程视频 OSS STS 临时凭证")
    @PreAuthorize("hasAuthority('course:manage:edit')")
    @PostMapping("/sts")
    public Result<Map<String, Object>> createVideoUploadSts(@RequestBody Map<String, Object> params) {
        String scene = params.get("scene") == null ? "course-video" : String.valueOf(params.get("scene"));
        if (!"course-video".equals(scene)) {
            return Result.error("当前仅支持课程视频上传");
        }

        String fileName = params.get("fileName") == null ? null : String.valueOf(params.get("fileName"));
        String contentType = params.get("contentType") == null ? null : String.valueOf(params.get("contentType"));

        try {
            return Result.success("获取 STS 临时凭证成功", courseVideoDirectUploadService.createStsSession(fileName, contentType));
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取 STS 临时凭证失败: " + e.getMessage());
        }
    }
}
