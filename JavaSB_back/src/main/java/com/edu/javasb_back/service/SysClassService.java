package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.dto.ClassImportDTO;
import org.springframework.data.domain.Page;
import java.util.List;

public interface SysClassService {
    Page<SysClass> getClasses(int page, int size, String classid, String grade, String schoolId);
    Result<SysClass> createClass(SysClass sysClass);
    SysClass updateClass(Long id, SysClass sysClass);
    default void deleteClass(Long id) {
        deleteClass(id, false);
    }
    void deleteClass(Long id, boolean cascade);
    SysClass getClassById(Long id);
    Result<Void> batchAddClasses(String schoolId, String grade, String format, int classStart, int classEnd);
    Result<Void> importClasses(List<ClassImportDTO> list);
}
