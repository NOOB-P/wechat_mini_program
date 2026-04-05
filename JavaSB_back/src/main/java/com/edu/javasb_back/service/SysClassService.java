package com.edu.javasb_back.service;

import com.edu.javasb_back.model.entity.SysClass;
import org.springframework.data.domain.Page;

public interface SysClassService {
    Page<SysClass> getClasses(int page, int size, String classid, String grade);
    SysClass createClass(SysClass sysClass);
    SysClass updateClass(Long id, SysClass sysClass);
    void deleteClass(Long id);
    SysClass getClassById(Long id);
}
