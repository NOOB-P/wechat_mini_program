package com.edu.javasb_back.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Data
@Entity
@Table(name = "courses")
public class Course {
    @Id
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 255)
    private String cover;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 20)
    private String type; // general, sync, family

    @Column(length = 50)
    private String subject;

    @Column(length = 50)
    private String grade;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "is_svip_only")
    private Boolean isSvipOnly = false;

    @Column(length = 100)
    private String author; // 讲师/作者

    @Column(name = "buy_count")
    private Integer buyers = 0; // 购买/学习人数

    @Column
    private Integer episodes = 0; // 总节数

    @Column(name = "is_recommend")
    private Integer isRecommend = 0;

    @Column(name = "midas_product_id", length = 100)
    private String midasProductId;

    @Transient
    private Boolean isCollected = false;

    @Transient
    private Boolean isPurchased = false;

    @Transient
    private Integer progress = 0;

    @Transient
    private Integer paymentStatus; // 0-待支付, 1-已支付, -1-已过期

    @Transient
    private String orderNo;

    @Transient
    private LocalDateTime orderCreateTime;

    @Transient
    private List<CourseEpisode> episodeList;

    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCover() { return cover; }
    public void setCover(String cover) { this.cover = cover; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Boolean getIsSvipOnly() { return isSvipOnly; }
    public void setIsSvipOnly(Boolean isSvipOnly) { this.isSvipOnly = isSvipOnly; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Integer getBuyers() { return buyers; }
    public void setBuyers(Integer buyers) { this.buyers = buyers; }
    public Integer getEpisodes() { return episodes; }
    public void setEpisodes(Integer episodes) { this.episodes = episodes; }
    public Boolean getIsCollected() { return isCollected; }
    public void setIsCollected(Boolean isCollected) { this.isCollected = isCollected; }
    public Boolean getIsPurchased() { return isPurchased; }
    public void setIsPurchased(Boolean isPurchased) { this.isPurchased = isPurchased; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public List<CourseEpisode> getEpisodeList() { return episodeList; }
    public void setEpisodeList(List<CourseEpisode> episodeList) { this.episodeList = episodeList; }
    public String getMidasProductId() { return midasProductId; }
    public void setMidasProductId(String midasProductId) { this.midasProductId = midasProductId; }
}
