package com.edu.javasb_back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exam_subjects")
public class ExamSubject {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "class_id", length = 50, nullable = false)
    private String classId;

    @Column(name = "subject_name", length = 50, nullable = false)
    private String subjectName;

    @Column(name = "paper_url", length = 500)
    private String paperUrl;

    @Column(name = "answer_url", length = 500)
    private String answerUrl;

    @Column(name = "score_uploaded")
    private Boolean scoreUploaded;

    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        if (scoreUploaded == null) {
            scoreUploaded = Boolean.FALSE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getPaperUrl() { return paperUrl; }
    public void setPaperUrl(String paperUrl) { this.paperUrl = paperUrl; }

    public String getAnswerUrl() { return answerUrl; }
    public void setAnswerUrl(String answerUrl) { this.answerUrl = answerUrl; }

    public Boolean getScoreUploaded() { return scoreUploaded; }
    public void setScoreUploaded(Boolean scoreUploaded) { this.scoreUploaded = scoreUploaded; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
