package com.edu.javasb_back.service;

import com.edu.javasb_back.model.entity.SysNotification;
import java.util.List;

public interface SysNotificationService {
    List<SysNotification> getAllNotifications(String title);
    SysNotification saveNotification(SysNotification notification);
    void deleteNotification(Long id);
    List<SysNotification> getPublishedNotifications(Long uid);
    void markAsRead(Long id, Long uid);
    void markDynamicAsRead(String id, Long uid);
    void markAllAsRead(Long uid);
}
