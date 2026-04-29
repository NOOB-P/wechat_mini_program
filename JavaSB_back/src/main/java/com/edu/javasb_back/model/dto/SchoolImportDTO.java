package com.edu.javasb_back.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class SchoolImportDTO {
    @ExcelProperty(index = 0)
    private String province;

    @ExcelProperty(index = 1)
    private String city;

    @ExcelProperty(index = 2)
    private String district;

    @ExcelProperty(index = 3)
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

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }
}
