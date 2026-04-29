package com.edu.javasb_back.service;

import java.util.List;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.SchoolImportDTO;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;

public interface SysSchoolService {
    Result<List<SchoolNodeVO>> getSchoolTree();
    Result<List<String>> getProvinces();
    Result<List<String>> getCities(String province);
    Result<List<SysSchool>> getSchoolsByCity(String city);
    Result<Void> addSchool(SysSchool school);
    Result<java.util.Map<String, Object>> getSchoolList(int page, int size, String keyword, String province, String city, String district, String name);
    Result<Void> updateSchool(SysSchool school);
    default Result<Void> deleteSchool(Long id) {
        return deleteSchool(id, false);
    }
    Result<Void> deleteSchool(Long id, boolean cascade);
    Result<Void> importSchools(List<SchoolImportDTO> list);
    java.util.Optional<SysSchool> getSchoolById(Long id);
    Result<List<SysSchool>> getAllSchools();

}
