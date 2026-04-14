package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.List;
import java.util.Map;

public interface VipService {
    Result<Map<String, Object>> getVipAnalysis(Long uid);

    Result<List<Map<String, Object>>> getWrongBookList(Long uid, Map<String, Object> params);

    Result<Map<String, Object>> getPrintConfig();

    Result<Void> submitPrintOrder(Long uid, Map<String, Object> orderData);

    Result<Map<String, Object>> getRechargeDisplayConfig(Long uid);
}
