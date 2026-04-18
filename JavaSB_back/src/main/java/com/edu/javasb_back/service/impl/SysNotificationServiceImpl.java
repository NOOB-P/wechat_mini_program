package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.repository.SysNotificationRepository;
import com.edu.javasb_back.service.SysNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class SysNotificationServiceImpl implements SysNotificationService {

    @Autowired
    private SysNotificationRepository sysNotificationRepository;

    @Override
    public List<SysNotification> getAllNotifications(String title) {
        if (StringUtils.hasText(title)) {
            return sysNotificationRepository.findByTitleContainingOrderByCreateTimeDesc(title);
        }
        return sysNotificationRepository.findAll();
    }

    @Override
    public SysNotification saveNotification(SysNotification notification) {
        if (notification.getCategory() == null) {
            notification.setCategory("system");
        }
        if (notification.getLevel() == null) {
            notification.setLevel("info");
        }
        if (notification.getTargetType() == null) {
            notification.setTargetType(0);
        }
        if (notification.getIsPublished() == null) {
            notification.setIsPublished(1);
        }
        return sysNotificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        sysNotificationRepository.deleteById(id);
    }

    @Override
    public List<SysNotification> getPublishedNotifications(Long uid) {
        return sysNotificationRepository.findPublishedByUid(uid);
    }
}
