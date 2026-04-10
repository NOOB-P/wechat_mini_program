package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exam_projects")
public class ExamProject {
    @Id
    @Column(length = 50)
    private String id;

    @Column(length = 200, nullable = false)
    private String name;

    @Column(name = "exam_type", length = 20, nullable = false)
    private String examType;

    @Column(name = "selected_school_ids", columnDefinition = "TEXT")
    private String selectedSchoolIds;

    @Column(name = "selected_class_ids", columnDefinition = "TEXT")
    private String selectedClassIds;

    @Column(name = "subject_names", columnDefinition = "TEXT")
    private String subjectNames;

    @Column(name = "school_count")
    private Integer schoolCount;

    @Column(name = "class_count")
    private Integer classCount;

    @Column(name = "student_count")
    private Integer studentCount;

    @Column(name = "subject_count")
    private Integer subjectCount;

    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

    public String getSelectedSchoolIds() { return selectedSchoolIds; }
    public void setSelectedSchoolIds(String selectedSchoolIds) { this.selectedSchoolIds = selectedSchoolIds; }

    public String getSelectedClassIds() { return selectedClassIds; }
    public void setSelectedClassIds(String selectedClassIds) { this.selectedClassIds = selectedClassIds; }

    public String getSubjectNames() { return subjectNames; }
    public void setSubjectNames(String subjectNames) { this.subjectNames = subjectNames; }

    public Integer getSchoolCount() { return schoolCount; }
    public void setSchoolCount(Integer schoolCount) { this.schoolCount = schoolCount; }

    public Integer getClassCount() { return classCount; }
    public void setClassCount(Integer classCount) { this.classCount = classCount; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public Integer getSubjectCount() { return subjectCount; }
    public void setSubjectCount(Integer subjectCount) { this.subjectCount = subjectCount; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
