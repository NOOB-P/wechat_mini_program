package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysFaq;
import com.edu.javasb_back.service.SysFaqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/faq")
public class SysFaqController {

    @Autowired
    private SysFaqService sysFaqService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @LogOperation("查询FAQ列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getFaqList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String question,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Integer status) {
        return sysFaqService.getFaqList(current, size, question, categoryName, status);
    }

    @LogOperation("获取FAQ分类")
    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        return sysFaqService.getCategories();
    }

    @LogOperation("添加FAQ")
    @PostMapping("/add")
    public Result<Void> addFaq(@RequestBody SysFaq faq) {
        return sysFaqService.addFaq(getCurrentUid(), faq);
    }

    @LogOperation("编辑FAQ")
    @PutMapping("/edit/{id}")
    public Result<Void> editFaq(@PathVariable String id, @RequestBody SysFaq updateData) {
        return sysFaqService.editFaq(getCurrentUid(), id, updateData);
    }

    @LogOperation("删除FAQ")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteFaq(@PathVariable String id) {
        return sysFaqService.deleteFaq(getCurrentUid(), id);
    }
}
