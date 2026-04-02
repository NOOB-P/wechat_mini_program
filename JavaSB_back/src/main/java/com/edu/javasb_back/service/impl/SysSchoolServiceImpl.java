package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.service.SysSchoolService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SysSchoolServiceImpl implements SysSchoolService {

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

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
                    SchoolNodeVO schoolNode = new SchoolNodeVO(school.getId(), school.getName(), "school");
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

        // 生成唯一ID
        String id = "SCH" + System.currentTimeMillis();
        school.setId(id);
        school.setType("school");
        school.setStatus(1);

        sysSchoolRepository.save(school);
        return Result.success("添加学校成功", null);
    }

    @Override
    public Result<Void> updateSchool(SysSchool school) {
        if (school.getId() == null || school.getId().isEmpty()) {
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
    public Result<Void> deleteSchool(String id) {
        if (id == null || id.isEmpty()) {
            return Result.error("学校ID不能为空");
        }
        java.util.Optional<SysSchool> schoolOpt = sysSchoolRepository.findById(id);
        if (schoolOpt.isEmpty()) {
            return Result.error("学校不存在");
        }
        SysSchool school = schoolOpt.get();
        school.setStatus(0); // 软删除
        sysSchoolRepository.save(school);
        return Result.success("删除成功", null);
    }

    @Override
    public Result<List<SysSchool>> getSchoolList(String keyword, String province, String city, String name) {
        Specification<SysSchool> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), 1));

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

        List<SysSchool> schools = sysSchoolRepository.findAll(spec);
        return Result.success("获取成功", schools);
    }
}