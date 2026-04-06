package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

/**
 * 试卷文件上传接口
 */
@RestController
@RequestMapping("/api/admin/resource/paper")
public class PaperUploadController {

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }

        // 获取文件后缀名
        String originalFilename = file.getOriginalFilename();
        String suffix = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // 校验是否为 PDF 或 DOCX 文件
        if (!".pdf".equalsIgnoreCase(suffix) && !".docx".equalsIgnoreCase(suffix) && !".doc".equalsIgnoreCase(suffix)) {
            return Result.error("仅支持上传 PDF 或 Word 文档");
        }

        // 生成新文件名
        String fileName = UUID.randomUUID().toString() + suffix;

        // 获取保存路径
        String paperDir = globalConfigProperties.getPaperDir();
        File destDir = new File(paperDir);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        File destFile = new File(destDir.getAbsolutePath() + File.separator + fileName);

        try {
            file.transferTo(destFile);
            // 返回访问路径
            return Result.success("上传成功", "/uploads/papers/" + fileName);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("上传失败: " + e.getMessage());
        }
    }
}
