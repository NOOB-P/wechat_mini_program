package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class SchoolImportDTO {
    @ExcelProperty("省份")
    private String province;

    @ExcelProperty("城市")
    private String city;

    @ExcelProperty("学校")
    private String schoolName;

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }
}