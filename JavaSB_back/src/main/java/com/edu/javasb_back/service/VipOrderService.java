package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;

import java.util.Map;

public interface VipOrderService {
    /**
     * 创建 VIP 订单（小程序在线购买）
     */
    Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData);

    /**
     * 校讯通开通并同步赠送 VIP
     */
    Result<Map<String, Object>> openSchoolVip(Long userUid, Integer months);

    /**
     * 支付成功回调
     */
    Result<String> paySuccessCallback(String orderNo);

    /**
     * 后台分页查询 VIP 订单
     */
    Result<Map<String, Object>> getVipOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus);
}
