package com.edu.javasb_back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_question_xkw_mapping")
public class ExamQuestionXkwMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false, length = 50)
    private String examId;

    @Column(name = "subject", nullable = false, length = 50)
    private String subject;

    @Column(name = "question_no", nullable = false, length = 50)
    private String questionNo;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "xkw_question_id", nullable = false, length = 100)
    private String xkwQuestionId;

    @Column(name = "matched_by", length = 20)
    private String matchedBy;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getQuestionNo() {
        return questionNo;
    }

    public void setQuestionNo(String questionNo) {
        this.questionNo = questionNo;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public String getXkwQuestionId() {
        return xkwQuestionId;
    }

    public void setXkwQuestionId(String xkwQuestionId) {
        this.xkwQuestionId = xkwQuestionId;
    }

    public String getMatchedBy() {
        return matchedBy;
    }

    public void setMatchedBy(String matchedBy) {
        this.matchedBy = matchedBy;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
