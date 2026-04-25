package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.LoginAsyncService;
import com.edu.javasb_back.utils.VipTypeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAsyncServiceImpl implements LoginAsyncService {

    private static final Logger log = LoggerFactory.getLogger(LoginAsyncServiceImpl.class);

    private static final String ONLINE_STATUS_KEY_PREFIX = "sys:user:online:";
    private static final String PENDING_SYNC_STATUS_SET = "sys:user:status_sync_set";

    @Autowired
    private SysAccountRepository accountRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Async
    @Override
    @Transactional
    public void asyncUpdateLoginInfo(Long uid) {
        try {
            log.info("开始异步处理用户登录信息, uid: {}", uid);
            
            // 1. 更新登录状态到 Redis，而不是直接写 MySQL
            updateOnlineStatusToRedis(uid);
            
            // 2. 检查会员过期
            accountRepository.findById(uid).ifPresent(this::checkVipExpiration);
            
            log.info("异步处理用户登录信息完成, uid: {}", uid);
        } catch (Exception e) {
            log.error("异步处理用户登录信息失败, uid: {}", uid, e);
        }
    }

    private void updateOnlineStatusToRedis(Long uid) {
        String key = ONLINE_STATUS_KEY_PREFIX + uid;
        // 设置 Redis 状态，有效期 30 分钟
        redisTemplate.opsForValue().set(key, "online", 30, TimeUnit.MINUTES);
        // 将 uid 加入待同步集合，供定时任务同步到数据库
        redisTemplate.opsForSet().add(PENDING_SYNC_STATUS_SET, uid.toString());
        log.debug("用户在线状态已写入 Redis 并加入同步队列, uid: {}", uid);
    }

    private void checkVipExpiration(SysAccount account) {
        if (account == null || account.getRoleId() == null || account.getRoleId() != 3) {
            return;
        }

        if (VipTypeUtils.normalizeAccountVipType(account)) {
            accountRepository.save(account);
            log.info("用户会员状态已更新, uid: {}", account.getUid());
        }
    }
}
