package com.edu.javasb_back.task;

import com.edu.javasb_back.repository.SysAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 用户在线状态同步任务
 */
@Component
public class UserStatusSyncTask {

    private static final Logger log = LoggerFactory.getLogger(UserStatusSyncTask.class);

    private static final String ONLINE_STATUS_KEY_PREFIX = "sys:user:online:";
    private static final String PENDING_SYNC_STATUS_SET = "sys:user:status_sync_set";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private SysAccountRepository accountRepository;

    /**
     * 每 10 分钟同步一次用户在线状态到数据库
     */
    @Scheduled(fixedDelay = 600000)
    public void syncUserStatus() {
        log.info("开始执行用户在线状态同步任务...");
        
        // 1. 获取所有待同步的 uid
        Set<String> uids = redisTemplate.opsForSet().members(PENDING_SYNC_STATUS_SET);
        if (CollectionUtils.isEmpty(uids)) {
            log.info("没有待同步的用户在线状态");
            return;
        }

        List<Long> onlineUids = new ArrayList<>();
        List<Long> offlineUids = new ArrayList<>();

        // 2. 检查每个用户的当前 Redis 状态
        for (String uidStr : uids) {
            Long uid = Long.parseLong(uidStr);
            String status = redisTemplate.opsForValue().get(ONLINE_STATUS_KEY_PREFIX + uid);
            
            if ("online".equals(status)) {
                onlineUids.add(uid);
            } else {
                // Redis 中已过期或不存在，视为离线
                offlineUids.add(uid);
            }
        }

        // 3. 批量更新数据库
        try {
            int onlineCount = 0;
            int offlineCount = 0;

            if (!onlineUids.isEmpty()) {
                onlineCount = accountRepository.batchUpdateLoginStatus(onlineUids, "online");
            }
            if (!offlineUids.isEmpty()) {
                offlineCount = accountRepository.batchUpdateLoginStatus(offlineUids, "offline");
            }

            log.info("用户在线状态同步完成: {} 人在线, {} 人离线", onlineCount, offlineCount);

            // 4. 同步成功后，从待同步集合中移除已处理的 uid
            // 注意：这里为了严谨，可以只移除 offlineUids，或者全部移除。
            // 全部移除是因为 online 的用户如果下次登录会重新加入集合。
            redisTemplate.opsForSet().remove(PENDING_SYNC_STATUS_SET, uids.toArray());
            
        } catch (Exception e) {
            log.error("用户在线状态同步失败", e);
        }
    }
}
