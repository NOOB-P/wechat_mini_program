package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.common.WechatBindRequiredException;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.WechatPayService;
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
import org.springframework.util.StringUtils;

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

    @Autowired
    private WechatPayService wechatPayService;

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
        List<PrintOrder> orders = printOrderRepository.findByUserUidOrderByCreateTimeDesc(uid);
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

    @Override
    public Result<Map<String, Object>> createWechatPayParams(Long uid, String orderNo) {
        if (orderNo == null || orderNo.trim().isEmpty()) {
            return Result.error("订单号不能为空");
        }

        Optional<PrintOrder> orderOptional = printOrderRepository.findByOrderNoAndUserUid(orderNo, uid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        PrintOrder order = orderOptional.get();
        if (order.getOrderStatus() != null && order.getOrderStatus() >= 2) {
            return Result.error(400, "订单已支付");
        }

        try {
            SysAccount account = sysAccountRepository.findById(uid)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            String openid = account.getWxid();
            if (!StringUtils.hasText(openid)) {
                return Result.wechatBindRequired("未绑定微信，请先绑定");
            }

            Map<String, Object> payParams = wechatPayService.createJsapiPayParams(
                    order.getOrderNo(),
                    "打印服务-" + order.getDocumentName(),
                    order.getTotalPrice(),
                    openid,
                    "print"
            );

            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", order.getOrderNo());
            result.put("paymentType", "WECHAT");
            result.put("payParams", payParams);
            result.put("documentName", order.getDocumentName());
            return Result.success("获取支付参数成功", result);
        } catch (WechatBindRequiredException e) {
            return Result.wechatBindRequired(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取支付参数失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<String> confirmVirtualPayment(Long uid, String orderNo, Map<String, Object> securityData) {
        if (orderNo == null || orderNo.trim().isEmpty()) {
            return Result.error("订单号不能为空");
        }

        Optional<PrintOrder> orderOptional = printOrderRepository.findByOrderNoAndUserUid(orderNo, uid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        PrintOrder order = orderOptional.get();
        if (order.getOrderStatus() != null && order.getOrderStatus() >= 2) {
            return Result.success("支付已处理");
        }

        boolean valid = wechatPayService.verifyVirtualPaymentSecurity(
                orderNo,
                buildPrintGoodsId(order),
                order.getTotalPrice(),
                uid,
                asString(securityData == null ? null : securityData.get("timestamp")),
                asString(securityData == null ? null : securityData.get("nonceStr")),
                resolveSecuritySignature(securityData)
        );
        if (!valid) {
            return Result.error(400, "虚拟支付校验失败");
        }

        paySuccess(orderNo);
        return Result.success("支付处理成功", null);
    }

    @Override
    @Transactional
    public void paySuccess(String orderNo) {
        Optional<PrintOrder> orderOptional = printOrderRepository.findByOrderNo(orderNo);
        if (orderOptional.isEmpty()) {
            return;
        }

        PrintOrder order = orderOptional.get();
        if (order.getOrderStatus() != null && order.getOrderStatus() >= 2) {
            return;
        }

        order.setOrderStatus(2);
        printOrderRepository.save(order);
    }

    @Override
    @Transactional
    public Result<Void> cancelOrder(Long uid, String orderNo) {
        Optional<PrintOrder> orderOptional = printOrderRepository.findByOrderNoAndUserUid(orderNo, uid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }
        PrintOrder order = orderOptional.get();
        if (order.getOrderStatus() != 1) {
            return Result.error("只能取消待支付订单");
        }
        order.setOrderStatus(0); // 0-已取消
        printOrderRepository.save(order);
        return Result.success("订单已取消", null);
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

    private String buildPrintGoodsId(PrintOrder order) {
        return "print-" + order.getId();
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }

    private String resolveSecuritySignature(Map<String, Object> securityData) {
        if (securityData == null) {
            return "";
        }
        Object confirmSignature = securityData.get("confirmSignature");
        if (confirmSignature != null && !confirmSignature.toString().trim().isEmpty()) {
            return confirmSignature.toString();
        }
        return asString(securityData.get("signature"));
    }
}
