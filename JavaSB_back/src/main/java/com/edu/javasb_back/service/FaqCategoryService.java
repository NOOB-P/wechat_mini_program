package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.FaqCategory;

import java.util.List;

public interface FaqCategoryService {
    Result<List<FaqCategory>> getCategoryList();

    Result<Void> addCategory(Long currentUid, FaqCategory category);

    Result<Void> updateCategory(Long currentUid, Integer id, FaqCategory updateData);

    Result<Void> deleteCategory(Long currentUid, Integer id);
}
