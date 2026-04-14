package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysFaq;
import com.edu.javasb_back.repository.FaqCategoryRepository;
import com.edu.javasb_back.repository.SysFaqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/faq")
public class SysFaqController {

    @Autowired
    private SysFaqRepository sysFaqRepository;

    @Autowired
    private FaqCategoryRepository faqCategoryRepository;

    @LogOperation("查询FAQ列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getFaqList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String question,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Integer status) {

        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<SysFaq> pageData = sysFaqRepository.findFaqs(question, categoryName, status, pageable);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageData.getContent());
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    @LogOperation("获取FAQ分类")
    @GetMapping("/categories")
    public Result<java.util.List<String>> getCategories() {
        return Result.success("获取成功", faqCategoryRepository.findAllActiveNames());
    }

    @LogOperation("添加FAQ")
    @PreAuthorize("hasAuthority('support:faq:add')")
    @PostMapping("/add")
    public Result<Void> addFaq(@RequestBody SysFaq faq) {
        if (faq.getQuestion() == null || faq.getQuestion().isEmpty()) {
            return Result.error("问题不能为空");
        }
        if (faq.getAnswer() == null || faq.getAnswer().isEmpty()) {
            return Result.error("答案不能为空");
        }
        if (faq.getId() == null || faq.getId().isEmpty()) {
            faq.setId("FAQ" + System.currentTimeMillis());
        }
        if (faq.getStatus() == null) {
            faq.setStatus(1);
        }
        sysFaqRepository.save(faq);
        return Result.success("添加成功", null);
    }

    @LogOperation("编辑FAQ")
    @PreAuthorize("hasAuthority('support:faq:edit')")
    @PutMapping("/edit/{id}")
    public Result<Void> editFaq(@PathVariable String id, @RequestBody SysFaq updateData) {
        Optional<SysFaq> faqOpt = sysFaqRepository.findById(id);
        if (faqOpt.isEmpty()) {
            return Result.error("FAQ不存在");
        }

        SysFaq faq = faqOpt.get();
        if (updateData.getQuestion() != null && !updateData.getQuestion().isEmpty()) {
            faq.setQuestion(updateData.getQuestion());
        }
        if (updateData.getAnswer() != null && !updateData.getAnswer().isEmpty()) {
            faq.setAnswer(updateData.getAnswer());
        }
        if (updateData.getCategoryName() != null && !updateData.getCategoryName().isEmpty()) {
            faq.setCategoryName(updateData.getCategoryName());
        }
        if (updateData.getStatus() != null) {
            faq.setStatus(updateData.getStatus());
        }

        sysFaqRepository.save(faq);
        return Result.success("编辑成功", null);
    }

    @LogOperation("删除FAQ")
    @PreAuthorize("hasAuthority('support:faq:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteFaq(@PathVariable String id) {
        if (!sysFaqRepository.existsById(id)) {
            return Result.error("FAQ不存在");
        }
        sysFaqRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}
