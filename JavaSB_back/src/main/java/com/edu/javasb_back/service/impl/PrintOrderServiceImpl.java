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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 打印订单服务实现类
 */
@Service
@Transactional(readOnly = true)
public class PrintOrderServiceImpl implements PrintOrderService {

    @Autowired
    private PrintOrderRepository printOrderRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    public Result<Map<String, Object>> findByParams(int current, int size, String orderNo, String userName, Integer orderStatus, String startDate, String endDate) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("createTime").descending());
        
        // 如果传入的参数为空字符串，则转为 null，以便 JpaRepository 的 @Query 能够正确处理
        String orderNoParam = (orderNo != null && !orderNo.trim().isEmpty()) ? orderNo : null;
        String userNameParam = (userName != null && !userName.trim().isEmpty()) ? userName : null;
        
        Page<PrintOrder> page = printOrderRepository.findByParams(
                orderNoParam,
                userNameParam,
                orderStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                pageable
        );
        
        LocalDateTime now = LocalDateTime.now();
        page.getContent().forEach(order -> {
            // 动态处理过期状态：待支付(1) 且 超过10分钟
            if (order.getOrderStatus() != null && order.getOrderStatus() == 1) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isBefore(now)) {
                    order.setOrderStatus(-1); // -1 表示已过期
                }
            }
        });

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
        if (order.isPresent()) {
            PrintOrder o = order.get();
            // 详情页也需要动态处理状态
            if (o.getOrderStatus() != null && o.getOrderStatus() == 1) {
                if (o.getCreateTime() != null && o.getCreateTime().plusMinutes(10).isBefore(LocalDateTime.now())) {
                    o.setOrderStatus(-1);
                }
            }
            return Result.success(o);
        }
        return Result.error("订单不存在");
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
    public List<PrintOrder> getPrintOrderExportList(String orderNo, String userName, Integer orderStatus, String startDate, String endDate) {
        List<PrintOrder> list = printOrderRepository.findByParams(
                normalizeKeyword(orderNo),
                normalizeKeyword(userName),
                orderStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                Sort.by(Sort.Direction.DESC, "createTime")
        );
        
        LocalDateTime now = LocalDateTime.now();
        list.forEach(order -> {
            // 动态处理过期状态：待支付(1) 且 超过10分钟
            if (order.getOrderStatus() != null && order.getOrderStatus() == 1) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isBefore(now)) {
                    order.setOrderStatus(-1); // -1 表示已过期
                }
            }
        });
        return list;
    }

    @Override
    public Result<List<PrintOrder>> getMyPrintOrders(Long uid) {
        String phone = sysAccountRepository.findById(uid)
                .map(com.edu.javasb_back.model.entity.SysAccount::getPhone)
                .orElse(null);
        
        if (phone == null) {
            return Result.success(List.of());
        }

        List<PrintOrder> orders = printOrderRepository.findByUserPhoneOrderByCreateTimeDesc(phone);
        if (orders.isEmpty()) {
            return Result.success(List.of());
        }

        LocalDateTime now = LocalDateTime.now();
        List<PrintOrder> validOrders = new ArrayList<>();

        for (PrintOrder order : orders) {
            // 已支付订单（待打印、待配送、已完成）
            if (order.getOrderStatus() != null && (order.getOrderStatus() >= 2)) {
                validOrders.add(order);
            } 
            // 待支付订单（orderStatus = 1），需检查是否在10分钟内
            else if (order.getOrderStatus() != null && order.getOrderStatus() == 1) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isAfter(now)) {
                    validOrders.add(order);
                }
            }
        }

        return Result.success(validOrders);
    }

    private String normalizeKeyword(String keyword) {
        return (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
    }

    private LocalDateTime parseStartDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return LocalDate.parse(value.trim()).atStartOfDay();
    }

    private LocalDateTime parseEndDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return LocalDate.parse(value.trim()).atTime(LocalTime.MAX);
    }
}
