package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
@RestController
@RequestMapping("/api/admin/resource/paper")
public class PaperUploadController {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @PreAuthorize("hasAuthority('paper:manage:upload')")
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }

        String originalFilename = file.getOriginalFilename();
        String suffix = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        if (!".pdf".equalsIgnoreCase(suffix) && !".docx".equalsIgnoreCase(suffix) && !".doc".equalsIgnoreCase(suffix)) {
            return Result.error("仅支持上传 PDF 或 Word 文档");
        }

        String fileName = UUID.randomUUID().toString() + suffix;
        String paperDir = globalConfigProperties.getPaperDir();
        File destDir = new File(paperDir);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        File destFile = new File(destDir.getAbsolutePath() + File.separator + fileName);
        try {
            file.transferTo(destFile);
            return Result.success("上传成功", "/uploads/papers/" + fileName);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("上传失败: " + e.getMessage());
        }
    }
}
