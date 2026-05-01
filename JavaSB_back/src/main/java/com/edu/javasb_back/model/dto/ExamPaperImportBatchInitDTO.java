package com.edu.javasb_back.model.dto;

public class ExamPaperImportBatchInitDTO {

    private String projectId;
    private String subjectName;

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
}
