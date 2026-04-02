package com.edu.javasb_back.model.dto;

import lombok.Data;

@Data
public class BindStudentDTO {
    private String studentName;
    private String studentId; // 对应前端传来的 studentNo
    private String password;
    private String phone;
    private String code;
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
}
