package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.VipOrder;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface VipOrderService {
    /**
     * 创建VIP订单 (小程序端)
     */
    Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData);

    /**
     * 支付成功回调逻辑 (小程序端/模拟)
     */
    Result<String> paySuccessCallback(String orderNo);

    /**
     * 分页查询VIP订单 (后台管理端)
     */
    Result<java.util.Map<String, Object>> getVipOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus);
}
