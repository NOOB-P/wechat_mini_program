package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysFaq;

import java.util.List;
import java.util.Map;

public interface SysFaqService {
    Result<Map<String, Object>> getFaqList(int current, int size, String question, String categoryName, Integer status);

    Result<List<String>> getCategories();

    Result<Void> addFaq(Long currentUid, SysFaq faq);

    Result<Void> editFaq(Long currentUid, String id, SysFaq updateData);

    Result<Void> deleteFaq(Long currentUid, String id);
}
