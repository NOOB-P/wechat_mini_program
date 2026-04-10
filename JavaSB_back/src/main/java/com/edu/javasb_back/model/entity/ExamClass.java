package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exam_classes")
public class ExamClass {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "school_id", length = 50, nullable = false)
    private String schoolId;

    @Column(length = 100, nullable = false)
    private String school;

    @Column(length = 50, nullable = false)
    private String grade;

    @Column(name = "class_name", length = 50, nullable = false)
    private String className;

    @Column(name = "source_class_id", length = 50)
    private String sourceClassId;

    @Column(name = "student_count")
    private Integer studentCount;

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

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getSchoolId() { return schoolId; }
    public void setSchoolId(String schoolId) { this.schoolId = schoolId; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSourceClassId() { return sourceClassId; }
    public void setSourceClassId(String sourceClassId) { this.sourceClassId = sourceClassId; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
