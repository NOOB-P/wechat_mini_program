package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.service.ExamClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ExamClassServiceImpl implements ExamClassService {

    @Autowired
    private ExamClassRepository examClassRepository;

    @Override
    public Result<Map<String, Object>> getClassList(int current, int size, String projectId, String school, String grade, String className) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Specification<ExamClass> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (projectId != null && !projectId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("projectId"), projectId.trim()));
            }
            if (school != null && !school.trim().isEmpty()) {
                predicates.add(cb.like(root.get("school"), "%" + school.trim() + "%"));
            }
            if (grade != null && !grade.trim().isEmpty()) {
                predicates.add(cb.like(root.get("grade"), "%" + grade.trim() + "%"));
            }
            if (className != null && !className.trim().isEmpty()) {
                predicates.add(cb.like(root.get("className"), "%" + className.trim() + "%"));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ExamClass> pageResult = examClassRepository.findAll(spec, pageable);
        
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageResult.getContent());
        resultData.put("total", pageResult.getTotalElements());
        resultData.put("current", pageResult.getNumber() + 1);
        resultData.put("size", pageResult.getSize());
        resultData.put("pages", pageResult.getTotalPages());

        return Result.success("获取成功", resultData);
    }

    @Override
    public Result<Void> addClass(ExamClass examClass) {
        examClass.setId("EC" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 5));
        examClassRepository.save(examClass);
        return Result.success("添加成功", null);
    }

    @Override
    public Result<Void> updateClass(ExamClass examClass) {
        if (!examClassRepository.existsById(examClass.getId())) {
            return Result.error("班级不存在");
        }
        examClassRepository.save(examClass);
        return Result.success("更新成功", null);
    }

    @Override
    public Result<Void> deleteClass(String id) {
        if (!examClassRepository.existsById(id)) {
            return Result.error("班级不存在");
        }
        examClassRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}