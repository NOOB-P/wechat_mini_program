package com.edu.javasb_back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exam_student_scores")
public class ExamStudentScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_id", length = 50, nullable = false)
    private String subjectId;

    @Column(name = "student_no", length = 50, nullable = false)
    private String studentNo;

    @Column(name = "student_name", length = 50)
    private String studentName;

    @Column(name = "answer_sheet_url", length = 500)
    private String answerSheetUrl;

    @Column(name = "answer_merge_info", columnDefinition = "TEXT")
    private String answerMergeInfo;

    @Column(name = "answer_sheet_layouts", columnDefinition = "TEXT")
    private String answerSheetLayouts;

    @Column(name = "score_entered")
    private Boolean scoreEntered;

    @Column(name = "total_score", nullable = false)
    private Double totalScore;

    @Column(name = "question_scores", columnDefinition = "JSON")
    private String questionScores;

    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        if (scoreEntered == null) {
            scoreEntered = Boolean.FALSE;
        }
        if (totalScore == null) {
            totalScore = 0D;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getAnswerSheetUrl() { return answerSheetUrl; }
    public void setAnswerSheetUrl(String answerSheetUrl) { this.answerSheetUrl = answerSheetUrl; }

    public String getAnswerMergeInfo() { return answerMergeInfo; }
    public void setAnswerMergeInfo(String answerMergeInfo) { this.answerMergeInfo = answerMergeInfo; }

    public String getAnswerSheetLayouts() { return answerSheetLayouts; }
    public void setAnswerSheetLayouts(String answerSheetLayouts) { this.answerSheetLayouts = answerSheetLayouts; }

    public Boolean getScoreEntered() { return scoreEntered; }
    public void setScoreEntered(Boolean scoreEntered) { this.scoreEntered = scoreEntered; }

    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }

    public String getQuestionScores() { return questionScores; }
    public void setQuestionScores(String questionScores) { this.questionScores = questionScores; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
