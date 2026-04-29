package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class StudentImportDTO {
    @ExcelProperty("学号")
    private String studentNo;

    @ExcelProperty("姓名")
    private String name;

    @ExcelProperty("省份")
    private String province;

    @ExcelProperty("城市")
    private String city;

    @ExcelProperty("区县")
    private String district;

    @ExcelProperty("学校")
    private String school;

    @ExcelProperty("年级")
    private String grade;

    @ExcelProperty("班级")
    private String className;

    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}
