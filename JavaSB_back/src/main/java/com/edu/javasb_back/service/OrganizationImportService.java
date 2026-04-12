package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import org.springframework.web.multipart.MultipartFile;

public interface OrganizationImportService {
    Result<Void> importSchoolStructure(MultipartFile file);

    Result<Void> importClassStructure(MultipartFile file, String schoolId);

    Result<Void> importStudentStructure(MultipartFile file, String schoolId, String classId);
}
