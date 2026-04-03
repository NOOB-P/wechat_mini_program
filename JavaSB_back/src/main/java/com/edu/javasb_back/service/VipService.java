package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import java.util.List;
import java.util.Map;

public interface VipService {
    /**
     * 获取 VIP 数据分析
     */
    Result<Map<String, Object>> getVipAnalysis(Long uid);

    /**
     * 获取错题本列表
     */
    Result<List<Map<String, Object>>> getWrongBookList(Long uid, Map<String, Object> params);

    /**
     * 获取打印配置
     */
    Result<Map<String, Object>> getPrintConfig();

    /**
     * 提交打印订单
     */
    Result<Void> submitPrintOrder(Long uid, Map<String, Object> orderData);
}
