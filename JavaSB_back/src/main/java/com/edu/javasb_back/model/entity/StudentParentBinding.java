package com.edu.javasb_back.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "student_parent_bindings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"parent_uid"})
})
public class StudentParentBinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    @Column(name = "parent_uid", nullable = false)
    private Long parentUid;

    @Column(name = "binding_type", length = 20)
    private String bindingType = "parent";

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Long getParentUid() { return parentUid; }
    public void setParentUid(Long parentUid) { this.parentUid = parentUid; }

    public String getBindingType() { return bindingType; }
    public void setBindingType(String bindingType) { this.bindingType = bindingType; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
