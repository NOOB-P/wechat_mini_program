package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysFaq;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysFaqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private SysAccountRepository sysAccountRepository;

    // 辅助方法：检查当前用户是否为管理员
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }
        String uidStr = authentication.getName();
        try {
            Optional<SysAccount> currentUserOpt = sysAccountRepository.findById(Long.parseLong(uidStr));
            return currentUserOpt.isPresent() && currentUserOpt.get().getRoleId() != null &&
                   (currentUserOpt.get().getRoleId() == 1 || currentUserOpt.get().getRoleId() == 2);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * 分页查询FAQ列表
     */
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
        return Result.success("获取成功", sysFaqRepository.findDistinctCategoryNames());
    }

    /**
     * 添加FAQ
     */
    @LogOperation("添加FAQ")
    @PostMapping("/add")
    public Result<Void> addFaq(@RequestBody SysFaq faq) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");
        if (faq.getQuestion() == null || faq.getQuestion().isEmpty()) {
            return Result.error("问题不能为空");
        }
        if (faq.getAnswer() == null || faq.getAnswer().isEmpty()) {
            return Result.error("解答不能为空");
        }
        
        // 生成自定义ID
        if (faq.getId() == null || faq.getId().isEmpty()) {
            faq.setId("FAQ" + System.currentTimeMillis());
        }

        if (faq.getStatus() == null) {
            faq.setStatus(1); // 默认启用
        }
        sysFaqRepository.save(faq);
        return Result.success("添加成功", null);
    }

    /**
     * 编辑FAQ
     */
    @LogOperation("编辑FAQ")
    @PutMapping("/edit/{id}")
    public Result<Void> editFaq(@PathVariable String id, @RequestBody SysFaq updateData) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");

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

    /**
     * 删除FAQ
     */
    @LogOperation("删除FAQ")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteFaq(@PathVariable String id) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");

        if (!sysFaqRepository.existsById(id)) {
            return Result.error("FAQ不存在");
        }

        sysFaqRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}