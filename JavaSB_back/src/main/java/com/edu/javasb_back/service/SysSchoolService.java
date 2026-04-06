package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import com.edu.javasb_back.model.dto.SchoolImportDTO;
import java.util.List;

public interface SysSchoolService {
    Result<List<SchoolNodeVO>> getSchoolTree();
    Result<Void> addSchool(SysSchool school);
    Result<java.util.Map<String, Object>> getSchoolList(int page, int size, String keyword, String province, String city, String name);
    Result<Void> updateSchool(SysSchool school);
    Result<Void> deleteSchool(Long id);
    Result<Void> importSchools(List<SchoolImportDTO> list);
    java.util.Optional<SysSchool> getSchoolById(Long id);
}