package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.dto.ClassImportDTO;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.service.SysClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SysClassServiceImpl implements SysClassService {

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysStudentRepository sysStudentRepository;

    @Override
    public Page<SysClass> getClasses(int page, int size, String classid, String grade, String schoolId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Specification<SysClass> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(classid)) {
                predicates.add(criteriaBuilder.like(root.get("classid"), "%" + classid + "%"));
            }
            if (StringUtils.hasText(grade)) {
                predicates.add(criteriaBuilder.like(root.get("grade"), "%" + grade + "%"));
            }
            if (StringUtils.hasText(schoolId)) {
                predicates.add(criteriaBuilder.equal(root.get("schoolId"), schoolId));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return sysClassRepository.findAll(spec, pageable);
    }

    @Override
    public Result<SysClass> createClass(SysClass sysClass) {
        // 检查关联学校下是否已存在同一年级同名的班级
        if (sysClassRepository.findFirstBySchoolIdAndGradeAndAlias(
                sysClass.getSchoolId(), sysClass.getGrade(), sysClass.getAlias()).isPresent()) {
            return Result.success(sysClass); // 忽略重复，返回成功但不插入
        }

        String classid;
        do {
            classid = "CLS" + System.currentTimeMillis();
        } while (sysClassRepository.existsByClassid(classid));
        
        sysClass.setClassid(classid);
        return Result.success(sysClassRepository.save(sysClass));
    }

    @Override
    public SysClass updateClass(Long id, SysClass sysClass) {
        SysClass existing = sysClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        if (!existing.getClassid().equals(sysClass.getClassid()) && 
            sysClassRepository.existsByClassid(sysClass.getClassid())) {
            throw new RuntimeException("班级ID已存在");
        }
        
        existing.setClassid(sysClass.getClassid());
        existing.setSchoolId(sysClass.getSchoolId());
        existing.setGrade(sysClass.getGrade());
        existing.setAlias(sysClass.getAlias());
        
        return sysClassRepository.save(existing);
    }

    @Override
    public void deleteClass(Long id) {
        SysClass sysClass = sysClassRepository.findById(id).orElse(null);
        if (sysClass != null && sysClass.getClassid() != null) {
            java.util.List<com.edu.javasb_back.model.entity.SysStudent> students = sysStudentRepository.findBySchoolIdAndGradeAndClassName(
                    sysClass.getSchoolId(), sysClass.getGrade(), sysClass.getAlias());
            if (students != null && !students.isEmpty()) {
                throw new RuntimeException("删除失败：当前班级下存在已绑定的学生，请先解绑或删除关联学生");
            }
        }
        sysClassRepository.deleteById(id);
    }

    @Override
    public SysClass getClassById(Long id) {
        return sysClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
    }

    @Override
    public Result<Void> batchAddClasses(String schoolId, String grade, String format, int classStart, int classEnd) {
        if (classEnd < classStart) {
            return Result.error("班级范围无效");
        }
        if (format == null || !format.contains("$")) {
            return Result.error("班级格式必须包含 $ 符号");
        }

        List<SysClass> classesToSave = new ArrayList<>();
        for (int i = 0; i <= (classEnd - classStart); i++) {
            String currentAlias = format.replace("$", String.valueOf(classStart + i));
            
            // 检查同名班级是否已存在
            if (sysClassRepository.findFirstBySchoolIdAndGradeAndAlias(schoolId, grade, currentAlias).isPresent()) {
                // 如果已存在则忽略
                continue;
            }

            SysClass sysClass = new SysClass();
            String classid;
            do {
                // 加入 i 作为偏移量防止同一毫秒内生成相同 ID
                classid = "CLS" + System.currentTimeMillis() + String.format("%03d", i);
            } while (sysClassRepository.existsByClassid(classid));

            sysClass.setClassid(classid);
            sysClass.setSchoolId(schoolId);
            sysClass.setGrade(grade);
            sysClass.setAlias(currentAlias);
            classesToSave.add(sysClass);
        }

        sysClassRepository.saveAll(classesToSave);
        return Result.success("批量添加班级成功", null);
    }

    @Override
    public Result<Void> importClasses(List<ClassImportDTO> list) {
        for (ClassImportDTO dto : list) {
            // 根据唯一标识判断是否存在，存在则更新，不存在则新增
            java.util.Optional<SysClass> existingOpt = sysClassRepository.findByClassid(dto.getClassid());
            
            if (existingOpt.isPresent()) {
                // 如果已存在，直接忽略跳过
                continue;
            }
            
            SysClass sysClass = new SysClass();
            sysClass.setClassid(dto.getClassid());
            sysClass.setSchoolId(dto.getSchoolId());
            sysClass.setGrade(dto.getGrade());
            sysClass.setAlias(dto.getAlias());
            sysClassRepository.save(sysClass);
        }
        return Result.success("导入班级成功", null);
    }
}
