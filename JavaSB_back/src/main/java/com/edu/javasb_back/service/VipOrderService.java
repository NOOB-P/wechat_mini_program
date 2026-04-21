package com.edu.javasb_back.service;

import java.util.List;
import java.util.Map;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;

public interface VipOrderService {

    Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData);

    Result<Map<String, Object>> createWechatPayParams(Long userUid, String orderNo);

    Result<String> confirmVirtualPayment(Long userUid, String orderNo, Map<String, Object> securityData);

    Result<Map<String, Object>> openSchoolVip(Long userUid, Integer months);

    Result<String> paySuccessCallback(String orderNo);

    /**
     * 获取当前用户的 VIP 订单列表（小程序端，包含倒计时逻辑）
     */
    Result<List<VipOrder>> getMyVipOrders(Long userUid);

    /**
     * 后台分页查询 VIP 订单
     */
    Result<Map<String, Object>> getVipOrderList(int current, int size, String keyword, String sourceType, Integer paymentStatus, String startDate, String endDate);

    List<VipOrder> getVipOrderExportList(String keyword, String sourceType, Integer paymentStatus,
                                         String startDate, String endDate);
}
