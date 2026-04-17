package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysFaq;
import com.edu.javasb_back.repository.FaqCategoryRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysFaqRepository;
import com.edu.javasb_back.service.SysFaqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysFaqServiceImpl implements SysFaqService {

    @Autowired
    private SysFaqRepository sysFaqRepository;

    @Autowired
    private FaqCategoryRepository faqCategoryRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    public Result<Map<String, Object>> getFaqList(int current, int size, String question, String categoryName, Integer status) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<SysFaq> pageData = sysFaqRepository.findFaqs(question, categoryName, status, pageable);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageData.getContent());
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success("获取成功", resultData);
    }

    @Override
    public Result<List<String>> getCategories() {
        return Result.success("获取成功", faqCategoryRepository.findAllActiveNames());
    }

    @Override
    @Transactional
    public Result<Void> addFaq(Long currentUid, SysFaq faq) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        if (!StringUtils.hasText(faq.getQuestion())) {
            return Result.error("问题不能为空");
        }
        if (!StringUtils.hasText(faq.getAnswer())) {
            return Result.error("解答不能为空");
        }
        if (!StringUtils.hasText(faq.getId())) {
            faq.setId("FAQ" + System.currentTimeMillis());
        }
        if (faq.getStatus() == null) {
            faq.setStatus(1);
        }
        sysFaqRepository.save(faq);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> editFaq(Long currentUid, String id, SysFaq updateData) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        SysFaq faq = sysFaqRepository.findById(id).orElse(null);
        if (faq == null) {
            return Result.error("FAQ不存在");
        }
        if (StringUtils.hasText(updateData.getQuestion())) {
            faq.setQuestion(updateData.getQuestion());
        }
        if (StringUtils.hasText(updateData.getAnswer())) {
            faq.setAnswer(updateData.getAnswer());
        }
        if (StringUtils.hasText(updateData.getCategoryName())) {
            faq.setCategoryName(updateData.getCategoryName());
        }
        if (updateData.getStatus() != null) {
            faq.setStatus(updateData.getStatus());
        }
        sysFaqRepository.save(faq);
        return Result.success("编辑成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteFaq(Long currentUid, String id) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        if (!sysFaqRepository.existsById(id)) {
            return Result.error("FAQ不存在");
        }
        sysFaqRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    private Result<Void> requireAdmin(Long currentUid) {
        if (currentUid == null) {
            return Result.error(401, "未登录");
        }
        SysAccount currentUser = sysAccountRepository.findById(currentUid).orElse(null);
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        Integer roleId = currentUser.getRoleId();
        if (roleId == null || (roleId != 1 && roleId != 2)) {
            return Result.error(403, "无权限执行此操作");
        }
        return Result.success("校验通过", null);
    }
}
