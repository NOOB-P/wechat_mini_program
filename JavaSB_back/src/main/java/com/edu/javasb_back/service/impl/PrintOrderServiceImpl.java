package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.PrintOrderRepository;
import com.edu.javasb_back.service.PrintOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 打印订单服务实现类
 */
@Service
public class PrintOrderServiceImpl implements PrintOrderService {

    @Autowired
    private PrintOrderRepository printOrderRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    public Result<Map<String, Object>> findByParams(int current, int size, String orderNo, String userName, Integer orderStatus) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("createTime").descending());
        
        // 如果传入的参数为空字符串，则转为 null，以便 JpaRepository 的 @Query 能够正确处理
        String orderNoParam = (orderNo != null && !orderNo.trim().isEmpty()) ? orderNo : null;
        String userNameParam = (userName != null && !userName.trim().isEmpty()) ? userName : null;
        
        Page<PrintOrder> page = printOrderRepository.findByParams(orderNoParam, userNameParam, orderStatus, pageable);
        
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", page.getContent());
        resultData.put("total", page.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        
        return Result.success(resultData);
    }

    @Override
    public Result<PrintOrder> findById(Long id) {
        Optional<PrintOrder> order = printOrderRepository.findById(id);
        return order.map(Result::success).orElseGet(() -> Result.error("订单不存在"));
    }

    @Override
    @Transactional
    public Result<PrintOrder> updateStatus(Long id, Integer status) {
        PrintOrder order = printOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        order.setOrderStatus(status);
        PrintOrder savedOrder = printOrderRepository.save(order);
        return Result.success(savedOrder);
    }

    @Override
    @Transactional
    public Result<PrintOrder> save(PrintOrder printOrder) {
        PrintOrder savedOrder = printOrderRepository.save(printOrder);
        return Result.success(savedOrder);
    }

    @Override
    public Result<List<PrintOrder>> getMyPrintOrders(Long uid) {
        if (uid == null) {
            return Result.error(401, "请先登录");
        }

        String phone = sysAccountRepository.findById(uid)
                .map(account -> account.getPhone())
                .orElse(null);
        if (phone == null || phone.isBlank()) {
            return Result.success(List.of());
        }

        Page<PrintOrder> page = printOrderRepository.findByParams(null, phone, null, PageRequest.of(0, 100, Sort.by("createTime").descending()));
        return Result.success(page.getContent());
    }

    
    public List<PrintOrder> getPrintOrderExportList(String orderNo, String userName, Integer orderStatus) {
        return printOrderRepository.findByParams(
                normalizeKeyword(orderNo),
                normalizeKeyword(userName),
                orderStatus,
                Sort.by(Sort.Direction.DESC, "createTime")
        );
    }

    private String normalizeKeyword(String keyword) {
        return (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
    }
}
