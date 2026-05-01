package com.edu.javasb_back.model.dto;

import java.util.ArrayList;
import java.util.List;

public class ExamPaperImportManifestDTO {

    private String projectId;
    private String subjectName;
    private String batchId;
    private List<ExamPaperImportFileDTO> files = new ArrayList<>();

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

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public List<ExamPaperImportFileDTO> getFiles() {
        return files;
    }

    public void setFiles(List<ExamPaperImportFileDTO> files) {
        this.files = files;
    }
}
