package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class ClassImportDTO {
    @ExcelProperty("班级唯一标识")
    private String classid;

    @ExcelProperty("关联学校唯一标识")
    private String schoolId;

    @ExcelProperty("年级")
    private String grade;

    @ExcelProperty("班级名称")
    private String alias;
}
