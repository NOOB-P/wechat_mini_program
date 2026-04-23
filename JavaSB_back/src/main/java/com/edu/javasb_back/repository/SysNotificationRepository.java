package com.edu.javasb_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edu.javasb_back.model.entity.SysNotification;

@Repository
public interface SysNotificationRepository extends JpaRepository<SysNotification, Long> {

    @Query("SELECT n FROM SysNotification n WHERE n.isPublished = 1 AND (n.targetType = 0 OR n.targetUid = :uid)")
    List<SysNotification> findPublishedByUid(Long uid);

    List<SysNotification> findByTitleContainingOrderByCreateTimeDesc(String title);

    @Query("""
            SELECT n
            FROM SysNotification n
            WHERE n.category = 'system'
              AND (:title IS NULL OR n.title LIKE %:title%)
              AND NOT (n.targetType = 1 AND COALESCE(n.actionText, '') = '立即支付')
            ORDER BY n.createTime DESC
            """)
    List<SysNotification> searchAdminSystemNotifications(@Param("title") String title);
}
