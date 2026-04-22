package com.edu.javasb_back.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "sys_notifications")
public class SysNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;
    private String category;
    private String level;
    
    @jakarta.persistence.Transient
    private String publisher;
    
    @Column(name = "target_type")
    private Integer targetType; // 0-全部用户, 1-指定用户
    
    @Column(name = "target_uid")
    private Long targetUid;
    
    @Column(name = "action_text")
    private String actionText;
    
    @Column(name = "action_path")
    private String actionPath;
    
    @Column(name = "is_published")
    private Integer isPublished;
    
    @Column(name = "read_uids")
    private String readUids; // JSON array of uids for targetType=0
    
    @Column(name = "is_read")
    private Integer isRead; // 0-unread, 1-read for targetType=1
    
    @Column(name = "create_time", insertable = false, updatable = false)
    private LocalDateTime createTime;
    
    @Column(name = "update_time", insertable = false, updatable = false)
    private LocalDateTime updateTime;

    // Getters and Setters are provided by @Data, but the user rules specify to add them
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public Integer getTargetType() { return targetType; }
    public void setTargetType(Integer targetType) { this.targetType = targetType; }
    public Long getTargetUid() { return targetUid; }
    public void setTargetUid(Long targetUid) { this.targetUid = targetUid; }
    public String getActionText() { return actionText; }
    public void setActionText(String actionText) { this.actionText = actionText; }
    public String getActionPath() { return actionPath; }
    public void setActionPath(String actionPath) { this.actionPath = actionPath; }
    public Integer getIsPublished() { return isPublished; }
    public void setIsPublished(Integer isPublished) { this.isPublished = isPublished; }
    public String getReadUids() { return readUids; }
    public void setReadUids(String readUids) { this.readUids = readUids; }
    public Integer getIsRead() { return isRead; }
    public void setIsRead(Integer isRead) { this.isRead = isRead; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
