package com.edu.javasb_back.model.dto;

import lombok.Data;

@Data
public class SchoolVipOpenDTO {
    private Integer months;

    public Integer getMonths() {
        return months;
    }

    public void setMonths(Integer months) {
        this.months = months;
    }
}
