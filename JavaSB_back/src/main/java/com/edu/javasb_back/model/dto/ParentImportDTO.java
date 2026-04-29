package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;

import lombok.Data;

@Data
public class ParentImportDTO {
    @ExcelProperty("省")
    private String province;

    @ExcelProperty("市")
    private String city;

    @ExcelProperty("校")
    private String school;

    @ExcelProperty("班级")
    private String className;

    @ExcelProperty("学生姓名")
    private String studentName;

    @ExcelProperty("手机号")
    private String phone;

    @ExcelProperty("会员类型")
    private String vipType;

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVipType() { return vipType; }
    public void setVipType(String vipType) { this.vipType = vipType; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
}
