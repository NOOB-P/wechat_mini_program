package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.SysStudentService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysStudentServiceImpl implements SysStudentService {

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Override
    public Result<Map<String, Object>> getStudentList(int page, int size, String name, String studentNo, String schoolId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));

        Specification<SysStudent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(name)) {
                predicates.add(cb.like(root.get("name"), "%" + name + "%"));
            }
            if (StringUtils.hasText(studentNo)) {
                predicates.add(cb.like(root.get("studentNo"), "%" + studentNo + "%"));
            }
            if (StringUtils.hasText(schoolId)) {
                predicates.add(cb.equal(root.get("schoolId"), schoolId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SysStudent> pageResult = sysStudentRepository.findAll(spec, pageable);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageResult.getContent());
        resultData.put("total", pageResult.getTotalElements());
        resultData.put("current", pageResult.getNumber() + 1);
        resultData.put("size", pageResult.getSize());
        resultData.put("pages", pageResult.getTotalPages());

        return Result.success("获取学生列表成功", resultData);
    }

    @Override
    public Result<Void> addStudent(SysStudent student) {
        if (!StringUtils.hasText(student.getStudentNo()) || !StringUtils.hasText(student.getName())) {
            return Result.error("学号和姓名不能为空");
        }

        // 检查学号是否已存在
        long count = sysStudentRepository.count((root, query, cb) -> cb.equal(root.get("studentNo"), student.getStudentNo()));
        if (count > 0) {
            return Result.error("该学号已存在，请勿重复添加");
        }

        String id = "STU" + System.currentTimeMillis();
        student.setId(id);
        if (student.getBoundCount() == null) {
            student.setBoundCount(0);
        }
        sysStudentRepository.save(student);
        return Result.success("添加学生成功", null);
    }

    @Override
    public Result<Void> updateStudent(SysStudent student) {
        if (!StringUtils.hasText(student.getId())) {
            return Result.error("学生ID不能为空");
        }
        SysStudent existing = sysStudentRepository.findById(student.getId()).orElse(null);
        if (existing == null) {
            return Result.error("学生不存在");
        }

        // 如果修改了学号，需检查是否冲突
        if (!existing.getStudentNo().equals(student.getStudentNo())) {
            long count = sysStudentRepository.count((root, query, cb) -> cb.equal(root.get("studentNo"), student.getStudentNo()));
            if (count > 0) {
                return Result.error("该学号已存在，无法修改");
            }
        }

        existing.setStudentNo(student.getStudentNo());
        existing.setName(student.getName());
        existing.setGender(student.getGender());
        existing.setSchoolId(student.getSchoolId());
        existing.setSchool(student.getSchool());
        existing.setGrade(student.getGrade());
        existing.setClassName(student.getClassName());
        existing.setParentPhone(student.getParentPhone());

        sysStudentRepository.save(existing);
        return Result.success("更新学生成功", null);
    }

    @Override
    public Result<Void> deleteStudent(String id) {
        SysStudent existing = sysStudentRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("学生不存在");
        }
        
        try {
            sysStudentRepository.deleteById(id);
        } catch (Exception e) {
            return Result.error("删除失败：该学生可能有绑定的成绩或其它关联数据");
        }
        
        return Result.success("删除成功", null);
    }
}