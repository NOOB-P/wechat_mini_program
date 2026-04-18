package com.edu.javasb_back.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.SchoolImportDTO;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.service.SysSchoolService;

import jakarta.persistence.criteria.Predicate;

@Service
public class SysSchoolServiceImpl implements SysSchoolService {

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysStudentRepository sysStudentRepository;

    @Override
    public Result<List<SchoolNodeVO>> getSchoolTree() {
        List<SysSchool> allSchools = sysSchoolRepository.findByStatus(1);

        // 分组: Province -> City -> List<School>
        Map<String, Map<String, List<SysSchool>>> grouped = allSchools.stream()
                .filter(s -> s.getProvince() != null && s.getCity() != null)
                .collect(Collectors.groupingBy(SysSchool::getProvince,
                        Collectors.groupingBy(SysSchool::getCity)));

        List<SchoolNodeVO> rootNodes = new ArrayList<>();
        int pIdCounter = 1;
        int cIdCounter = 1;

        for (Map.Entry<String, Map<String, List<SysSchool>>> provinceEntry : grouped.entrySet()) {
            String provinceName = provinceEntry.getKey();
            SchoolNodeVO provinceNode = new SchoolNodeVO("p" + pIdCounter++, provinceName, "province");
            List<SchoolNodeVO> cityNodes = new ArrayList<>();

            for (Map.Entry<String, List<SysSchool>> cityEntry : provinceEntry.getValue().entrySet()) {
                String cityName = cityEntry.getKey();
                SchoolNodeVO cityNode = new SchoolNodeVO("c" + cIdCounter++, cityName, "city");
                List<SchoolNodeVO> schoolNodes = new ArrayList<>();

                for (SysSchool school : cityEntry.getValue()) {
                    SchoolNodeVO schoolNode = new SchoolNodeVO(school.getSchoolId(), school.getName(), "school");
                    // TODO: 如果需要年级和班级，可以在这里继续加载
                    // 目前直接将 children 设置为 空列表 或 null
                    schoolNode.setChildren(new ArrayList<>());
                    schoolNodes.add(schoolNode);
                }

                cityNode.setChildren(schoolNodes);
                cityNodes.add(cityNode);
            }

            provinceNode.setChildren(cityNodes);
            rootNodes.add(provinceNode);
        }

        return Result.success("获取成功", rootNodes);
    }

    @Override
    public Result<List<String>> getProvinces() {
        return Result.success(sysSchoolRepository.findDistinctProvinces());
    }

    @Override
    public Result<List<String>> getCities(String province) {
        return Result.success(sysSchoolRepository.findDistinctCities(province));
    }

    @Override
    public Result<List<SysSchool>> getSchoolsByCity(String city) {
        return Result.success(sysSchoolRepository.findByCity(city));
    }

    @Override
    public Result<Void> addSchool(SysSchool school) {
        if (school.getProvince() == null || school.getProvince().isEmpty()) {
            return Result.error("省份不能为空");
        }
        if (school.getCity() == null || school.getCity().isEmpty()) {
            return Result.error("城市不能为空");
        }
        if (school.getName() == null || school.getName().isEmpty()) {
            return Result.error("学校名称不能为空");
        }

        // 检查该省市下是否已存在同名学校
        if (sysSchoolRepository.findFirstByProvinceAndCityAndName(school.getProvince(), school.getCity(), school.getName()).isPresent()) {
            return Result.success("该学校已存在，忽略添加", null);
        }

        // 生成唯一标识，重试确保唯一
        String schoolId;
        do {
            schoolId = "SCH" + System.currentTimeMillis();
        } while (sysSchoolRepository.findBySchoolId(schoolId).isPresent());
        
        school.setSchoolId(schoolId);
        school.setType("school");
        school.setStatus(1);

        sysSchoolRepository.save(school);
        return Result.success("添加学校成功", null);
    }

    @Override
    public Result<Void> updateSchool(SysSchool school) {
        if (school.getId() == null) {
            return Result.error("学校ID不能为空");
        }
        java.util.Optional<SysSchool> existing = sysSchoolRepository.findById(school.getId());
        if (existing.isEmpty()) {
            return Result.error("学校不存在");
        }
        SysSchool target = existing.get();
        target.setProvince(school.getProvince());
        target.setCity(school.getCity());
        target.setName(school.getName());
        sysSchoolRepository.save(target);
        return Result.success("更新成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteSchool(Long id, boolean cascade) {
        if (id == null) {
            return Result.error("学校ID不能为空");
        }
        java.util.Optional<SysSchool> schoolOpt = sysSchoolRepository.findById(id);
        if (schoolOpt.isEmpty()) {
            return Result.error("学校不存在");
        }
        SysSchool school = schoolOpt.get();

        // 检查是否有绑定的班级
        if (school.getSchoolId() != null) {
            List<SysClass> classes = sysClassRepository.findBySchoolId(school.getSchoolId());
            if (classes != null && !classes.isEmpty()) {
                if (!cascade) {
                    return Result.error("删除失败：当前学校下存在已绑定的班级，请先解绑或删除关联班级");
                }
                // 级联删除班级和学生
                for (SysClass sysClass : classes) {
                    // 删除该班级下的所有学生
                    java.util.List<com.edu.javasb_back.model.entity.SysStudent> students = sysStudentRepository.findBySchoolIdAndGradeAndClassName(
                            sysClass.getSchoolId(), sysClass.getGrade(), sysClass.getAlias());
                    if (students != null && !students.isEmpty()) {
                        sysStudentRepository.deleteAll(students);
                    }
                    // 删除班级
                    sysClassRepository.delete(sysClass);
                }
            }
        }

        sysSchoolRepository.delete(school); // 物理删除
        return Result.success("删除成功", null);
    }

    @Override
    public java.util.Optional<SysSchool> getSchoolById(Long id) {
        return sysSchoolRepository.findById(id);
    }

    @Override
    public Result<List<SysSchool>> getAllSchools() {
        return Result.success("获取成功", sysSchoolRepository.findAll(Sort.by(Sort.Direction.ASC, "name")));
    }

    @Override

    public Result<Map<String, Object>> getSchoolList(int page, int size, String keyword, String province, String city, String name) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));

        Specification<SysSchool> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                String likeKeyword = "%" + keyword + "%";
                predicates.add(cb.or(
                    cb.like(root.get("name"), likeKeyword),
                    cb.like(root.get("province"), likeKeyword),
                    cb.like(root.get("city"), likeKeyword)
                ));
            }

            if (province != null && !province.isEmpty()) {
                predicates.add(cb.equal(root.get("province"), province));
            }

            if (city != null && !city.isEmpty()) {
                predicates.add(cb.equal(root.get("city"), city));
            }

            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(root.get("name"), "%" + name + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SysSchool> pageResult = sysSchoolRepository.findAll(spec, pageable);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", pageResult.getContent());
        resultData.put("total", pageResult.getTotalElements());
        resultData.put("current", pageResult.getNumber() + 1);
        resultData.put("size", pageResult.getSize());
        resultData.put("pages", pageResult.getTotalPages());

        return Result.success("获取成功", resultData);
    }

    @Override
    @Transactional
    public Result<Void> importSchools(List<SchoolImportDTO> list) {
        for (SchoolImportDTO dto : list) {
            // 根据省市区名称查找学校是否存在
            java.util.Optional<SysSchool> schoolOpt = sysSchoolRepository.findFirstByProvinceAndCityAndName(
                    dto.getProvince(), dto.getCity(), dto.getSchoolName());
            
            if (schoolOpt.isPresent()) {
                // 如果已存在，直接忽略跳过
                continue;
            }
            
            SysSchool school = new SysSchool();
            
            // 生成唯一标识，重试确保唯一
            String schoolId;
            do {
                schoolId = "SCH" + System.currentTimeMillis();
            } while (sysSchoolRepository.findBySchoolId(schoolId).isPresent());
            
            school.setSchoolId(schoolId);
            school.setProvince(dto.getProvince());
            school.setCity(dto.getCity());
            school.setName(dto.getSchoolName());
            school.setType("school");
            school.setStatus(1);
            sysSchoolRepository.save(school);
        }
        return Result.success("导入成功", null);
    }
}
