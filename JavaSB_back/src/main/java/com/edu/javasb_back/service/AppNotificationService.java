package com.edu.javasb_back.service;

import com.edu.javasb_back.model.vo.AppNotificationVO;

import java.util.List;

public interface AppNotificationService {

    List<AppNotificationVO> getUserNotifications(Long uid, Integer limit);
    void markAllAsRead(Long uid);
}
