package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.FaqCategory;
import com.edu.javasb_back.repository.FaqCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/faq/category")
public class FaqCategoryController {

    @Autowired
    private FaqCategoryRepository faqCategoryRepository;

    @LogOperation("查询FAQ分类列表")
    @PreAuthorize("hasAuthority('support:faq-category:list')")
    @GetMapping("/list")
    public Result<List<FaqCategory>> getCategoryList() {
        return Result.success("获取成功", faqCategoryRepository.findAllByOrderBySortAsc());
    }

    @LogOperation("新增FAQ分类")
    @PreAuthorize("hasAuthority('support:faq-category:add')")
    @PostMapping("/add")
    public Result<Void> addCategory(@RequestBody FaqCategory category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            return Result.error("分类名称不能为空");
        }
        faqCategoryRepository.save(category);
        return Result.success("添加成功", null);
    }

    @LogOperation("更新FAQ分类")
    @PreAuthorize("hasAuthority('support:faq-category:edit')")
    @PutMapping("/edit/{id}")
    public Result<Void> updateCategory(@PathVariable Integer id, @RequestBody FaqCategory updateData) {
        Optional<FaqCategory> categoryOpt = faqCategoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            return Result.error("分类不存在");
        }
        FaqCategory category = categoryOpt.get();
        if (updateData.getName() != null && !updateData.getName().isEmpty()) {
            category.setName(updateData.getName());
        }
        if (updateData.getSort() != null) {
            category.setSort(updateData.getSort());
        }
        if (updateData.getStatus() != null) {
            category.setStatus(updateData.getStatus());
        }
        faqCategoryRepository.save(category);
        return Result.success("更新成功", null);
    }

    @LogOperation("删除FAQ分类")
    @PreAuthorize("hasAuthority('support:faq-category:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCategory(@PathVariable Integer id) {
        faqCategoryRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}
