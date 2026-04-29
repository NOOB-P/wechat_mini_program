package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class ClassImportDTO {
    @ExcelProperty("省份")
    private String province;

    @ExcelProperty("城市")
    private String city;

    @ExcelProperty("区县")
    private String district;

    @ExcelProperty("学校")
    private String schoolName;

    @ExcelProperty("年级")
    private String grade;

    @ExcelProperty("班级")
    private String alias;

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
}
