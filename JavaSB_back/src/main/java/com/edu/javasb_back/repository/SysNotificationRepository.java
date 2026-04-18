package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysNotificationRepository extends JpaRepository<SysNotification, Long> {
    
    @Query("SELECT n FROM SysNotification n WHERE n.isPublished = 1 AND (n.targetType = 0 OR n.targetUid = :uid)")
    List<SysNotification> findPublishedByUid(Long uid);

    List<SysNotification> findByTitleContainingOrderByCreateTimeDesc(String title);
}
