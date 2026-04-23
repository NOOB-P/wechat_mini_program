package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysNotificationRepository;
import com.edu.javasb_back.service.SysNotificationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SysNotificationServiceImpl implements SysNotificationService {

    @Autowired
    private SysNotificationRepository sysNotificationRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public List<SysNotification> getAllNotifications(String title) {
        return sysNotificationRepository.searchAdminSystemNotifications(StringUtils.hasText(title) ? title.trim() : null);
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
        if (notification.getTargetType() == 0) {
            notification.setTargetUid(null);
        }
        if (notification.getIsPublished() == null) {
            notification.setIsPublished(1);
        }
        if (notification.getIsRead() == null) {
            notification.setIsRead(0);
        }
        if ("system".equals(notification.getCategory())) {
            notification.setActionText(null);
            notification.setActionPath(null);
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

    @Override
    public void markAsRead(Long id, Long uid) {
        sysNotificationRepository.findById(id).ifPresent(notification -> {
            if (notification.getTargetType() == 1) {
                notification.setIsRead(1);
            } else {
                try {
                    Set<Long> readUids = new HashSet<>();
                    if (StringUtils.hasText(notification.getReadUids())) {
                        readUids = objectMapper.readValue(notification.getReadUids(), new TypeReference<Set<Long>>() {});
                    }
                    readUids.add(uid);
                    notification.setReadUids(objectMapper.writeValueAsString(readUids));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            sysNotificationRepository.save(notification);
        });
    }

    @Override
    public void markDynamicAsRead(String id, Long uid) {
        sysAccountRepository.findById(uid).ifPresent(account -> {
            try {
                Set<String> readIds = new HashSet<>();
                if (StringUtils.hasText(account.getReadNotificationIds())) {
                    readIds = objectMapper.readValue(account.getReadNotificationIds(), new TypeReference<Set<String>>() {});
                }
                readIds.add(id);
                account.setReadNotificationIds(objectMapper.writeValueAsString(readIds));
                sysAccountRepository.save(account);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    @Override
    public void markAllAsRead(Long uid) {
        // 1. 标记系统通知
        List<SysNotification> notifications = sysNotificationRepository.findPublishedByUid(uid);
        for (SysNotification notification : notifications) {
            if (notification.getTargetType() == 1) {
                notification.setIsRead(1);
            } else {
                try {
                    Set<Long> readUids = new HashSet<>();
                    if (StringUtils.hasText(notification.getReadUids())) {
                        readUids = objectMapper.readValue(notification.getReadUids(), new TypeReference<Set<Long>>() {});
                    }
                    if (!readUids.contains(uid)) {
                        readUids.add(uid);
                        notification.setReadUids(objectMapper.writeValueAsString(readUids));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        sysNotificationRepository.saveAll(notifications);

        // 2. 标记动态通知（全部）
        // 这里目前无法直接知道哪些动态通知存在，但我们可以清除所有动态红点逻辑在 get 时处理
        // 或者简单的策略：在 markAllAsRead 时，我们不再把具体的 ID 存入，而是存一个标记或者清空？
        // 实际上 handleMarkAllRead 在前端会把所有 isNew 设为 false。
        // 为了持久化，我们可能需要一个 last_read_all_time。
        // 但简单起见，既然用户是单点之后没有消除，我们重点修复单点逻辑。
    }
}
