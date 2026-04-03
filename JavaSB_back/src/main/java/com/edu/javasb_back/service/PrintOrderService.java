package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;

import java.util.Map;

/**
 * 打印订单服务接口
 */
public interface PrintOrderService {
    
    /**
     * 分页查询打印订单
     */
    Result<Map<String, Object>> findByParams(int current, int size, String orderNo, String userName, Integer orderStatus);
    
    /**
     * 根据ID获取订单详情
     */
    Result<PrintOrder> findById(Long id);
    
    /**
     * 更新订单状态
     */
    Result<PrintOrder> updateStatus(Long id, Integer status);
    
    /**
     * 保存订单 (用于模拟或创建新订单)
     */
    Result<PrintOrder> save(PrintOrder printOrder);
}
