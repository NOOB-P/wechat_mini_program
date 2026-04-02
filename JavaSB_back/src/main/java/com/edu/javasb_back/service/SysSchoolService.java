package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.vo.SchoolNodeVO;
import java.util.List;

public interface SysSchoolService {
    Result<List<SchoolNodeVO>> getSchoolTree();
    Result<Void> addSchool(SysSchool school);
    Result<List<SysSchool>> getSchoolList(String keyword, String province, String city, String name);
    Result<Void> updateSchool(SysSchool school);
    Result<Void> deleteSchool(String id);
}