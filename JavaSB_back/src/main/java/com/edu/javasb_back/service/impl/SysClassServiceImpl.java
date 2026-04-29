package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.dto.ClassImportDTO;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamResultRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.SysClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
public class SysClassServiceImpl implements SysClassService {

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysStudentRepository sysStudentRepository;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private ExamStudentScoreRepository examStudentScoreRepository;

    @Override
    public Page<SysClass> getClasses(int page, int size, String classid, String grade, String schoolId, String alias) {
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
            if (StringUtils.hasText(alias)) {
                predicates.add(criteriaBuilder.like(root.get("alias"), "%" + alias + "%"));
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
    @Transactional
    public void deleteClass(Long id, boolean cascade) {
        SysClass sysClass = sysClassRepository.findById(id).orElse(null);
        if (sysClass != null) {
            List<SysStudent> students = getClassStudents(sysClass);
            if (!cascade && !students.isEmpty()) {
                throw new RuntimeException("删除失败：当前班级下存在已绑定的学生，请先解绑或删除关联学生");
            }
            if (cascade) {
                deleteStudentsCascade(students);
            }
        }
        sysClassRepository.deleteById(id);
    }

    private List<SysStudent> getClassStudents(SysClass sysClass) {
        LinkedHashMap<String, SysStudent> studentMap = new LinkedHashMap<>();

        if (StringUtils.hasText(sysClass.getClassid())) {
            for (SysStudent student : sysStudentRepository.findByClassId(sysClass.getClassid())) {
                studentMap.put(student.getId(), student);
            }
        }

        for (SysStudent student : sysStudentRepository.findBySchoolIdAndGradeAndClassName(
                sysClass.getSchoolId(), sysClass.getGrade(), sysClass.getAlias())) {
            studentMap.put(student.getId(), student);
        }

        return new ArrayList<>(studentMap.values());
    }

    private void deleteStudentsCascade(Collection<SysStudent> students) {
        for (SysStudent student : students) {
            deleteSingleStudentCascade(student);
        }
    }

    private void deleteSingleStudentCascade(SysStudent student) {
        List<StudentParentBinding> bindings = bindingRepository.findByStudentId(student.getId());
        if (!bindings.isEmpty()) {
            for (StudentParentBinding binding : bindings) {
                sysAccountRepository.findById(binding.getParentUid()).ifPresent(account -> {
                    account.setIsBoundStudent(0);
                    sysAccountRepository.save(account);
                });
            }
            bindingRepository.deleteAll(bindings);
        }

        if (StringUtils.hasText(student.getStudentNo())) {
            var examResults = examResultRepository.findAllByStudentNo(student.getStudentNo());
            if (!examResults.isEmpty()) {
                examResultRepository.deleteAll(examResults);
            }

            var examScores = examStudentScoreRepository.findByStudentNo(student.getStudentNo());
            if (!examScores.isEmpty()) {
                examStudentScoreRepository.deleteAll(examScores);
            }
        }

        sysStudentRepository.deleteById(student.getId());
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

    @Autowired
    private com.edu.javasb_back.repository.SysSchoolRepository sysSchoolRepository;

    @Override
    @Transactional
    public Result<Void> importClasses(List<ClassImportDTO> list) {
        for (ClassImportDTO dto : list) {
            // 1. 获取或创建学校
            java.util.Optional<com.edu.javasb_back.model.entity.SysSchool> schoolOpt = findExistingSchool(
                    dto.getProvince(), dto.getCity(), dto.getDistrict(), dto.getSchoolName());
            
            String schoolId;
            if (schoolOpt.isPresent()) {
                schoolId = schoolOpt.get().getSchoolId();
            } else {
                // 创建新学校
                com.edu.javasb_back.model.entity.SysSchool newSchool = new com.edu.javasb_back.model.entity.SysSchool();
                do {
                    schoolId = "SCH" + System.currentTimeMillis();
                } while (sysSchoolRepository.findBySchoolId(schoolId).isPresent());
                newSchool.setSchoolId(schoolId);
                newSchool.setProvince(dto.getProvince());
                newSchool.setCity(dto.getCity());
                newSchool.setDistrict(dto.getDistrict());
                newSchool.setName(dto.getSchoolName());
                newSchool.setType("school");
                newSchool.setStatus(1);
                sysSchoolRepository.save(newSchool);
            }

            // 2. 检查关联学校下是否已存在同一年级同名的班级
            if (sysClassRepository.findFirstBySchoolIdAndGradeAndAlias(
                    schoolId, dto.getGrade(), dto.getAlias()).isPresent()) {
                continue;
            }
            
            SysClass sysClass = new SysClass();
            String classid;
            do {
                classid = "CLS" + System.currentTimeMillis();
            } while (sysClassRepository.existsByClassid(classid));
            
            sysClass.setClassid(classid);
            sysClass.setSchoolId(schoolId);
            sysClass.setGrade(dto.getGrade());
            sysClass.setAlias(dto.getAlias());
            sysClassRepository.save(sysClass);
        }
        return Result.success("导入班级成功", null);
    }

    private java.util.Optional<com.edu.javasb_back.model.entity.SysSchool> findExistingSchool(
            String province,
            String city,
            String district,
            String schoolName) {
        if (district == null || district.trim().isEmpty()) {
            return sysSchoolRepository.findFirstByProvinceAndCityAndName(province, city, schoolName);
        }
        return sysSchoolRepository.findFirstByProvinceAndCityAndDistrictAndName(province, city, district, schoolName);
    }
}
