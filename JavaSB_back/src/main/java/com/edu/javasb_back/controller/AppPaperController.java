package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import com.edu.javasb_back.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序端试卷资源接口
 */
@RestController
@RequestMapping("/api/app/resource/paper")
public class AppPaperController {

    @Autowired
    private PaperService paperService;

    /**
     * 获取试卷科目列表
     */
    @GetMapping("/subjects")
    public Result getSubjects() {
        List<PaperSubject> subjects = paperService.getAllSubjects();
        return Result.success(subjects);
    }

    /**
     * 获取试卷列表
     */
    @GetMapping("/list")
    public Result getPaperList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isRecommend,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return paperService.getAppPaperList(keyword, subject, grade, type, isRecommend, pageNum, pageSize);
    }

    /**
     * 获取试卷详情
     */
    @GetMapping("/detail/{id}")
    public Result getPaperDetail(@PathVariable Long id) {
        ExamPaper paper = paperService.getPaperById(id);
        if (paper == null) {
            return Result.error("试卷不存在");
        }
        return Result.success(paper);
    }

    /**
     * 增加下载量计数
     */
    @PostMapping("/download/{id}")
    public Result incrementDownload(@PathVariable Long id) {
        paperService.incrementDownloadCount(id);
        return Result.success("计数成功");
    }
}
