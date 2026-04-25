package com.edu.javasb_back.utils;

import java.time.LocalDateTime;

import com.edu.javasb_back.model.entity.SysAccount;

public final class VipTypeUtils {

    public static final int NONE = 0;
    public static final int VIP = 1;
    public static final int SVIP = 2;

    private VipTypeUtils() {
    }

    public static boolean isVip(Integer vipType) {
        return vipType != null && vipType >= VIP;
    }

    public static boolean isSvip(Integer vipType) {
        return vipType != null && vipType >= SVIP;
    }

    public static Integer resolveVipType(Integer currentVipType, LocalDateTime vipExpireTime, LocalDateTime now) {
        if (vipExpireTime != null && !vipExpireTime.isBefore(now)) {
            return isSvip(currentVipType) ? SVIP : VIP;
        }
        return NONE;
    }

    public static boolean normalizeAccountVipType(SysAccount account) {
        if (account == null) {
            return false;
        }
        Integer targetVipType = resolveVipType(
                account.getVipType(),
                account.getVipExpireTime(),
                LocalDateTime.now()
        );
        Integer currentVipType = account.getVipType() == null ? NONE : account.getVipType();
        if (!currentVipType.equals(targetVipType)) {
            account.setVipType(targetVipType);
            if (targetVipType == NONE) {
                account.setVipConfigId(null);
            }
            return true;
        }
        return false;
    }

    public static Integer resolveVipTypeByTierCode(String tierCode) {
        if (tierCode == null) {
            return NONE;
        }
        String normalized = tierCode.trim().toUpperCase();
        if ("SVIP".equals(normalized)) {
            return SVIP;
        }
        if ("VIP".equals(normalized)) {
            return VIP;
        }
        return NONE;
    }

    public static String resolveVipTypeLabel(Integer vipType) {
        if (isSvip(vipType)) {
            return "SVIP";
        }
        if (isVip(vipType)) {
            return "VIP";
        }
        return "NORMAL";
    }
}
