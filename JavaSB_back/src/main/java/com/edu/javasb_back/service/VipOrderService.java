package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;

import java.util.List;
import java.util.Map;

public interface VipOrderService {
    /**
     * 创建 VIP 订单（小程序在线购买）
     */
    Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData);

    /**
     * 为 VIP 订单生成微信支付参数
     */
    Result<Map<String, Object>> createWechatPayParams(Long userUid, String orderNo);

    /**
     * 校讯通开通并同步赠送 VIP
     */
    Result<Map<String, Object>> openSchoolVip(Long userUid, Integer months);

    /**
     * 支付成功回调
     */
    Result<String> paySuccessCallback(String orderNo);

    /**
     * 获取当前用户的 VIP 订单列表（小程序端，包含倒计时逻辑）
     */
    Result<List<VipOrder>> getMyVipOrders(Long userUid);

    /**
     * 后台分页查询 VIP 订单
     */
    Result<Map<String, Object>> getVipOrderList(int current, int size, String keyword, String sourceType, Integer paymentStatus, String startDate, String endDate);

    /**
     * 后台导出 VIP 订单
     */
    List<VipOrder> getVipOrderExportList(String keyword, String sourceType, Integer paymentStatus, String startDate, String endDate);
}
