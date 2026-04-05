package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.StudentImportDTO;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.SysSchoolRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class SysStudentServiceImpl implements SysStudentService {

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysClassRepository sysClassRepository;

    @Override
    public Result<Map<String, Object>> getStudentList(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));

        Specification<SysStudent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String likeKeyword = "%" + keyword + "%";
                predicates.add(cb.or(
                    cb.like(root.get("studentNo"), likeKeyword),
                    cb.like(root.get("name"), likeKeyword),
                    cb.like(root.get("school"), likeKeyword),
                    cb.like(root.get("grade"), likeKeyword),
                    cb.like(root.get("className"), likeKeyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SysStudent> pageResult = sysStudentRepository.findAll(spec, pageable);

        // 处理关联数据显示
        List<SysStudent> students = pageResult.getContent();
        for (SysStudent student : students) {
            if (StringUtils.hasText(student.getSchoolId())) {
                sysSchoolRepository.findBySchoolId(student.getSchoolId()).ifPresent(school -> {
                    student.setSchool(school.getName());
                });
            }
            if (StringUtils.hasText(student.getClassId())) {
                sysClassRepository.findByClassid(student.getClassId()).ifPresent(sysClass -> {
                    student.setGrade(sysClass.getGrade());
                    student.setClassName(sysClass.getAlias());
                });
            }
        }

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", students);
        resultData.put("total", pageResult.getTotalElements());
        resultData.put("current", pageResult.getNumber() + 1);
        resultData.put("size", pageResult.getSize());
        resultData.put("pages", pageResult.getTotalPages());

        return Result.success("获取学生列表成功", resultData);
    }

    @Override
    @Transactional
    public Result<Void> importStudents(List<StudentImportDTO> students) {
        for (StudentImportDTO dto : students) {
            // 1. 处理学校
            Optional<SysSchool> schoolOpt = sysSchoolRepository.findByProvinceAndCityAndName(
                    dto.getProvince(), dto.getCity(), dto.getSchool());
            
            String schoolId;
            if (schoolOpt.isPresent()) {
                schoolId = schoolOpt.get().getSchoolId();
            } else {
                // 创建新学校
                SysSchool newSchool = new SysSchool();
                schoolId = "SCH" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 5);
                newSchool.setSchoolId(schoolId);
                newSchool.setProvince(dto.getProvince());
                newSchool.setCity(dto.getCity());
                newSchool.setName(dto.getSchool());
                newSchool.setType("school");
                newSchool.setStatus(1);
                sysSchoolRepository.save(newSchool);
            }

            // 2. 处理学生
            Optional<SysStudent> studentOpt = sysStudentRepository.findByStudentNo(dto.getStudentNo());
            SysStudent student;
            if (studentOpt.isPresent()) {
                student = studentOpt.get();
            } else {
                student = new SysStudent();
                student.setId(UUID.randomUUID().toString());
                student.setStudentNo(dto.getStudentNo());
            }

            student.setName(dto.getName());
            student.setSchoolId(schoolId);
            student.setClassId(null); // Excel import doesn't have classId yet, maybe we need to update StudentImportDTO if we want it, but for now just set null.
            student.setSchool(dto.getSchool()); // 冗余
            student.setGrade(dto.getGrade());
            student.setClassName(dto.getClassName());
            
            sysStudentRepository.save(student);
        }
        return Result.success("批量导入学生成功", null);
    }

    @Override
    public Result<Void> addStudent(SysStudent student) {
        if (!StringUtils.hasText(student.getStudentNo()) || !StringUtils.hasText(student.getName())) {
            return Result.error("学号和姓名不能为空");
        }

        // 检查学号是否已存在
        Optional<SysStudent> existingOpt = sysStudentRepository.findByStudentNo(student.getStudentNo());
        if (existingOpt.isPresent()) {
            return Result.error("该学号已存在，请勿重复添加");
        }

        String id = UUID.randomUUID().toString();
        student.setId(id);
        if (student.getBoundCount() == null) {
            student.setBoundCount(0);
        }
        
        // 自动更新冗余字段
        if (StringUtils.hasText(student.getSchoolId())) {
            sysSchoolRepository.findBySchoolId(student.getSchoolId()).ifPresent(school -> {
                student.setSchool(school.getName());
            });
        }
        
        if (StringUtils.hasText(student.getClassId())) {
            sysClassRepository.findByClassid(student.getClassId()).ifPresent(sysClass -> {
                student.setGrade(sysClass.getGrade());
                student.setClassName(sysClass.getAlias());
            });
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
            Optional<SysStudent> conflictOpt = sysStudentRepository.findByStudentNo(student.getStudentNo());
            if (conflictOpt.isPresent()) {
                return Result.error("该学号已存在，请更换其他学号");
            }
        }

        existing.setStudentNo(student.getStudentNo());
        existing.setName(student.getName());
        existing.setSchoolId(student.getSchoolId());
        existing.setClassId(student.getClassId());
        
        // 自动更新冗余字段
        if (StringUtils.hasText(student.getSchoolId())) {
            sysSchoolRepository.findBySchoolId(student.getSchoolId()).ifPresent(school -> {
                existing.setSchool(school.getName());
            });
        } else {
            existing.setSchool(null);
        }
        
        if (StringUtils.hasText(student.getClassId())) {
            sysClassRepository.findByClassid(student.getClassId()).ifPresent(sysClass -> {
                existing.setGrade(sysClass.getGrade());
                existing.setClassName(sysClass.getAlias());
            });
        } else {
            existing.setGrade(null);
            existing.setClassName(null);
        }

        sysStudentRepository.save(existing);
        return Result.success("更新学生信息成功", null);
    }

    @Override
    public Result<Void> deleteStudent(String id) {
        if (!sysStudentRepository.existsById(id)) {
            return Result.error("学生不存在");
        }
        sysStudentRepository.deleteById(id);
        return Result.success("删除学生成功", null);
    }
}
