package com.edu.javasb_back.service;

import com.edu.javasb_back.model.entity.SysAccount;

public interface LoginAsyncService {
    /**
     * 异步更新登录状态和检查会员过期
     */
    void asyncUpdateLoginInfo(Long uid);
}
