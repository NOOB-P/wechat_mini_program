package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;

import java.util.List;
import java.util.Map;

public interface SysLogService {
    Result<Map<String, Object>> getLogList(int current, int size, String userName, String operation, Integer status);

    Result<Void> deleteLogs(List<Long> ids);
}
