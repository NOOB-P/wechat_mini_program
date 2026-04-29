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

    @Autowired
    private com.edu.javasb_back.repository.StudentParentBindingRepository bindingRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysAccountRepository sysAccountRepository;

    @Autowired
    private com.edu.javasb_back.repository.ExamResultRepository examResultRepository;

    @Override
    public Result<Map<String, Object>> getStudentList(int page, int size, String keyword, String schoolId, String classId) {
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
            if (StringUtils.hasText(schoolId)) {
                predicates.add(cb.equal(root.get("schoolId"), schoolId));
            }
            if (StringUtils.hasText(classId)) {
                predicates.add(cb.equal(root.get("classId"), classId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SysStudent> pageResult = sysStudentRepository.findAll(spec, pageable);

        // 处理关联数据显示
        List<SysStudent> students = pageResult.getContent();
        for (SysStudent student : students) {
            if (StringUtils.hasText(student.getSchoolId())) {
                sysSchoolRepository.findBySchoolId(student.getSchoolId()).ifPresent(school -> {
                    // 格式化学校名称为：xx省xx市xx学校
                    String formattedSchoolName = "";
                    if (StringUtils.hasText(school.getProvince())) {
                        formattedSchoolName += school.getProvince();
                    }
                    if (StringUtils.hasText(school.getCity())) {
                        formattedSchoolName += school.getCity();
                    }
                    if (StringUtils.hasText(school.getDistrict())) {
                        formattedSchoolName += school.getDistrict();
                    }
                    if (StringUtils.hasText(school.getName())) {
                        formattedSchoolName += school.getName();
                    }
                    student.setSchool(formattedSchoolName);
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
    public Result<List<String>> getGrades(String schoolId) {
        return Result.success(sysStudentRepository.findDistinctGrades(schoolId));
    }

    @Override
    public Result<List<String>> getClasses(String schoolId, String grade) {
        return Result.success(sysStudentRepository.findDistinctClasses(schoolId, grade));
    }

    @Override
    public Result<List<SysStudent>> getStudents(String schoolId, String grade, String className) {
        return Result.success(sysStudentRepository.findBySchoolIdAndGradeAndClassName(schoolId, grade, className));
    }

    @Override
    @Transactional
    public Result<Void> importStudents(List<StudentImportDTO> students) {
        for (StudentImportDTO dto : students) {
            // 1. 处理学校
            Optional<SysSchool> schoolOpt = findExistingSchool(
                    dto.getProvince(), dto.getCity(), dto.getDistrict(), dto.getSchool());
            
            String schoolId;
            if (schoolOpt.isPresent()) {
                schoolId = schoolOpt.get().getSchoolId();
            } else {
                // 创建新学校
                SysSchool newSchool = new SysSchool();
                do {
                    schoolId = "SCH" + System.currentTimeMillis();
                } while (sysSchoolRepository.findBySchoolId(schoolId).isPresent());
                newSchool.setSchoolId(schoolId);
                newSchool.setProvince(dto.getProvince());
                newSchool.setCity(dto.getCity());
                newSchool.setDistrict(dto.getDistrict());
                newSchool.setName(dto.getSchool());
                newSchool.setType("school");
                newSchool.setStatus(1);
                sysSchoolRepository.save(newSchool);
            }

            // 2. 处理班级
            Optional<SysClass> classOpt = sysClassRepository.findFirstBySchoolIdAndGradeAndAlias(
                    schoolId, dto.getGrade(), dto.getClassName());
            
            String classId;
            if (classOpt.isPresent()) {
                classId = classOpt.get().getClassid();
            } else {
                // 创建新班级
                SysClass newClass = new SysClass();
                do {
                    classId = "CLS" + System.currentTimeMillis();
                } while (sysClassRepository.existsByClassid(classId));
                newClass.setClassid(classId);
                newClass.setSchoolId(schoolId);
                newClass.setGrade(dto.getGrade());
                newClass.setAlias(dto.getClassName());
                sysClassRepository.save(newClass);
            }

            // 3. 处理学生
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
            student.setClassId(classId);
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
                student.setSchool(formatSchoolName(school));
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
                existing.setSchool(formatSchoolName(school));
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
    @Transactional
    public Result<Void> deleteStudent(String id) {
        if (!sysStudentRepository.existsById(id)) {
            return Result.error("学生不存在");
        }
        
        Optional<SysStudent> studentOpt = sysStudentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return Result.error("学生不存在");
        }
        SysStudent student = studentOpt.get();

        long boundCount = bindingRepository.countByStudentId(id);
        if (boundCount > 0) {
            return Result.error("删除失败：当前学生已绑定家长账号，请先解绑");
        }
        
        // 删除相关的考试成绩记录，避免外键约束失败
        if (StringUtils.hasText(student.getStudentNo())) {
            List<com.edu.javasb_back.model.entity.ExamResult> results = examResultRepository.findAllByStudentNo(student.getStudentNo());
            if (results != null && !results.isEmpty()) {
                examResultRepository.deleteAll(results);
            }
        }

        sysStudentRepository.deleteById(id);
        return Result.success("删除学生成功", null);
    }

    private String formatSchoolName(SysSchool school) {
        StringBuilder builder = new StringBuilder();
        if (school == null) {
            return "";
        }
        if (StringUtils.hasText(school.getProvince())) {
            builder.append(school.getProvince());
        }
        if (StringUtils.hasText(school.getCity())) {
            builder.append(school.getCity());
        }
        if (StringUtils.hasText(school.getDistrict())) {
            builder.append(school.getDistrict());
        }
        if (StringUtils.hasText(school.getName())) {
            builder.append(school.getName());
        }
        return builder.toString();
    }

    private Optional<SysSchool> findExistingSchool(String province, String city, String district, String schoolName) {
        if (!StringUtils.hasText(district)) {
            return sysSchoolRepository.findFirstByProvinceAndCityAndName(province, city, schoolName);
        }
        return sysSchoolRepository.findFirstByProvinceAndCityAndDistrictAndName(province, city, district, schoolName);
    }

    @Override
    @Transactional
    public Result<String> batchDeleteStudents(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return Result.error("未选中任何学生");
        }

        int successCount = 0;
        int failCount = 0;
        List<String> failedNames = new ArrayList<>();
        for (String id : ids) {
            String studentName = "未知学生";
            Optional<SysStudent> studentOpt = sysStudentRepository.findById(id);
            if (studentOpt.isPresent()) {
                studentName = studentOpt.get().getName();
            }

            Result<Void> result = deleteStudent(id);
            if (result.getCode() == 200) {
                successCount++;
            } else {
                failCount++;
                failedNames.add(studentName);
            }
        }

        if (failCount > 0) {
            String failedMsg = String.join("，", failedNames);
            String detailMsg = "批量删除完成。成功" + successCount + " 个，跳过 " + failCount
                    + " 个存在绑定账户的学生。未能删除的学生：[" + failedMsg + "]";
            return Result.success("操作完成，部分成功", detailMsg);
        }
        return Result.success("批量删除成功", "批量删除成功");
    }

    @Override
    public Result<List<String>> getBoundParents(String studentId) {
        if (!StringUtils.hasText(studentId)) {
            return Result.error("学生ID不能为空");
        }
        List<com.edu.javasb_back.model.entity.StudentParentBinding> bindings = bindingRepository.findByStudentId(studentId);
        List<String> parentPhones = new java.util.ArrayList<>();
        for (com.edu.javasb_back.model.entity.StudentParentBinding binding : bindings) {
            sysAccountRepository.findById(binding.getParentUid()).ifPresent(account -> {
                if (StringUtils.hasText(account.getPhone())) {
                    parentPhones.add(account.getPhone());
                }
            });
        }
        return Result.success("获取成功", parentPhones);
    }
}
