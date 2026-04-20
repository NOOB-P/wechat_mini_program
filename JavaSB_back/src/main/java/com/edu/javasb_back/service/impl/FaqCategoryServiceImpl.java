package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.FaqCategory;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.repository.FaqCategoryRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.FaqCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class FaqCategoryServiceImpl implements FaqCategoryService {

    @Autowired
    private FaqCategoryRepository faqCategoryRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    public Result<List<FaqCategory>> getCategoryList() {
        return Result.success("获取成功", faqCategoryRepository.findAllByOrderBySortAsc());
    }

    @Override
    @Transactional
    public Result<Void> addCategory(Long currentUid, FaqCategory category) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        if (!StringUtils.hasText(category.getName())) {
            return Result.error("分类名称不能为空");
        }
        faqCategoryRepository.save(category);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> updateCategory(Long currentUid, Integer id, FaqCategory updateData) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        FaqCategory category = faqCategoryRepository.findById(id).orElse(null);
        if (category == null) {
            return Result.error("分类不存在");
        }
        if (StringUtils.hasText(updateData.getName())) {
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

    @Override
    @Transactional
    public Result<Void> deleteCategory(Long currentUid, Integer id) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        faqCategoryRepository.deleteById(id);
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
