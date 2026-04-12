package com.edu.javasb_back.model.dto;

import java.util.List;

public class ExamProjectSaveDTO {

    private String id;
    private String name;
    private String examType;
    private List<String> schoolIds;
    private List<String> classIds;
    private List<String> subjects;
    private java.util.Map<String, Object> benchmarks;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

    public List<String> getSchoolIds() { return schoolIds; }
    public void setSchoolIds(List<String> schoolIds) { this.schoolIds = schoolIds; }

    public List<String> getClassIds() { return classIds; }
    public void setClassIds(List<String> classIds) { this.classIds = classIds; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }

    public java.util.Map<String, Object> getBenchmarks() { return benchmarks; }
    public void setBenchmarks(java.util.Map<String, Object> benchmarks) { this.benchmarks = benchmarks; }
}
