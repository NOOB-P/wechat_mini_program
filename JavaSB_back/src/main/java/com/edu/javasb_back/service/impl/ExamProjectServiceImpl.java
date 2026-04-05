package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.repository.ExamProjectRepository;
import com.edu.javasb_back.service.ExamProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ExamProjectServiceImpl implements ExamProjectService {

    @Autowired
    private ExamProjectRepository examProjectRepository;

    @Override
    public Result<Map<String, Object>> getProjectList(int current, int size, String name) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Specification<ExamProject> spec = (root, query, cb) -> {
            if (name != null && !name.trim().isEmpty()) {
                return cb.like(root.get("name"), "%" + name.trim() + "%");
            }
            return null;
        };

        Page<ExamProject> pageResult = examProjectRepository.findAll(spec, pageable);
        
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageResult.getContent());
        resultData.put("total", pageResult.getTotalElements());
        resultData.put("current", pageResult.getNumber() + 1);
        resultData.put("size", pageResult.getSize());
        resultData.put("pages", pageResult.getTotalPages());

        return Result.success("获取成功", resultData);
    }

    @Override
    public Result<Void> addProject(ExamProject project) {
        project.setId("EP" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 5));
        examProjectRepository.save(project);
        return Result.success("添加成功", null);
    }

    @Override
    public Result<Void> updateProject(ExamProject project) {
        if (!examProjectRepository.existsById(project.getId())) {
            return Result.error("项目不存在");
        }
        examProjectRepository.save(project);
        return Result.success("更新成功", null);
    }

    @Override
    public Result<Void> deleteProject(String id) {
        if (!examProjectRepository.existsById(id)) {
            return Result.error("项目不存在");
        }
        examProjectRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}