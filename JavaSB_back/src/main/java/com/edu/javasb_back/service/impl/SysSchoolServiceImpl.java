package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.service.SysSchoolService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public Result<List<SysSchool>> getSchoolList() {
        List<SysSchool> allSchools = sysSchoolRepository.findByStatus(1);
        return Result.success("获取成功", allSchools);
    }
}