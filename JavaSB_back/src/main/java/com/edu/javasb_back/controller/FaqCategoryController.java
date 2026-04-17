package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.FaqCategory;
import com.edu.javasb_back.service.FaqCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/faq/category")
public class FaqCategoryController {

    @Autowired
    private FaqCategoryService faqCategoryService;

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

    @LogOperation("查询FAQ分类列表")
    @GetMapping("/list")
    public Result<List<FaqCategory>> getCategoryList() {
        return faqCategoryService.getCategoryList();
    }

    @LogOperation("新增FAQ分类")
    @PostMapping("/add")
    public Result<Void> addCategory(@RequestBody FaqCategory category) {
        return faqCategoryService.addCategory(getCurrentUid(), category);
    }

    @LogOperation("更新FAQ分类")
    @PutMapping("/edit/{id}")
    public Result<Void> updateCategory(@PathVariable Integer id, @RequestBody FaqCategory updateData) {
        return faqCategoryService.updateCategory(getCurrentUid(), id, updateData);
    }

    @LogOperation("删除FAQ分类")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCategory(@PathVariable Integer id) {
        return faqCategoryService.deleteCategory(getCurrentUid(), id);
    }
}
