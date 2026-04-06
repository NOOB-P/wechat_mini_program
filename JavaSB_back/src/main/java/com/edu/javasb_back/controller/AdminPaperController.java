package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import com.edu.javasb_back.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 后台管理试卷接口
 */
@RestController
@RequestMapping("/api/admin/resource/paper")
public class AdminPaperController {

    @Autowired
    private PaperService paperService;

    // --- 试卷管理 ---

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
        Page<ExamPaper> page = paperService.getPaperList(
                keyword, subject, grade, type, isRecommend,
                PageRequest.of(pageNum - 1, pageSize, Sort.by("id").descending())
        );
        return Result.success(page);
    }

    @PostMapping("/save")
    public Result savePaper(@RequestBody ExamPaper paper) {
        return Result.success(paperService.savePaper(paper));
    }

    @DeleteMapping("/delete/{id}")
    public Result deletePaper(@PathVariable Long id) {
        paperService.deletePaper(id);
        return Result.success("删除成功");
    }

    // --- 科目管理 ---

    @GetMapping("/subjects")
    public Result getSubjects() {
        return Result.success(paperService.getAllSubjects());
    }

    @PostMapping("/subject/save")
    public Result saveSubject(@RequestBody PaperSubject subject) {
        return Result.success(paperService.saveSubject(subject));
    }

    @DeleteMapping("/subject/delete/{id}")
    public Result deleteSubject(@PathVariable Long id) {
        paperService.deleteSubject(id);
        return Result.success("删除成功");
    }
}
