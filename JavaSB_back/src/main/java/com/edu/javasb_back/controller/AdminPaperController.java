package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import com.edu.javasb_back.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/resource/paper")
public class AdminPaperController {

    @Autowired
    private PaperService paperService;

    @PreAuthorize("hasAuthority('paper:manage:list')")
    @GetMapping("/type/stats")
    public Result getTypeStats() {
        return Result.success(paperService.getTypeStatistics());
    }

    @GetMapping("/grade/stats")
    public Result getGradeStats(@RequestParam String type) {
        return Result.success(paperService.getGradeStatistics(type));
    }

    @GetMapping("/subject/stats")
    public Result getSubjectStats(@RequestParam String type, @RequestParam String grade) {
        return Result.success(paperService.getSubjectStatistics(type, grade));
    }

    // --- 试卷管理 ---

    @GetMapping("/list")
    public Result<?> getPaperList(
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
                PageRequest.of(pageNum - 1, pageSize, Sort.by("sortOrder").ascending().and(Sort.by("createTime").ascending()))

        );
        return Result.success(page);
    }

    @PreAuthorize("hasAuthority('paper:manage:save')")
    @PostMapping("/save")
    public Result<?> savePaper(@RequestBody ExamPaper paper) {
        return Result.success(paperService.savePaper(paper));
    }

    @PreAuthorize("hasAuthority('paper:manage:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<?> deletePaper(@PathVariable Long id) {
        paperService.deletePaper(id);
        return Result.success("删除成功");
    }

    @PreAuthorize("hasAuthority('paper:subject:list')")
    @GetMapping("/subjects")
    public Result<?> getSubjects() {
        return Result.success(paperService.getAllSubjects());
    }

    @PreAuthorize("hasAuthority('paper:subject:save')")
    @PostMapping("/subject/save")
    public Result<?> saveSubject(@RequestBody PaperSubject subject) {
        return Result.success(paperService.saveSubject(subject));
    }

    @PreAuthorize("hasAuthority('paper:subject:delete')")
    @DeleteMapping("/subject/delete/{id}")
    public Result<?> deleteSubject(@PathVariable Long id) {
        paperService.deleteSubject(id);
        return Result.success("删除成功");
    }
}
