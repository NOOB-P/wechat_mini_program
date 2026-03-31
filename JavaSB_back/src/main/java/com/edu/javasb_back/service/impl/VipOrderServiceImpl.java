package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.VipOrderRepository;
import com.edu.javasb_back.service.VipOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class VipOrderServiceImpl implements VipOrderService {

    @Autowired
    private VipOrderRepository vipOrderRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Override
    @Transactional
    public Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData) {
        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (!accountOptional.isPresent()) {
            return Result.error("用户不存在");
        }
        SysAccount account = accountOptional.get();

        VipOrder order = new VipOrder();
        order.setOrderNo("VOD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + (new Random().nextInt(900) + 100));
        order.setUserUid(userUid);
        order.setUserName(account.getNickname());
        order.setUserPhone(account.getPhone());
        order.setPackageType((String) orderData.get("packageType"));
        order.setPeriod((String) orderData.get("period"));
        order.setPrice(new BigDecimal(orderData.get("price").toString()));
        order.setPaymentStatus(0); // 待支付
        order.setPaymentMethod("微信");

        VipOrder savedOrder = vipOrderRepository.save(order);
        return Result.success(savedOrder);
    }

    @Override
    @Transactional
    public Result<String> paySuccessCallback(String orderNo) {
        Optional<VipOrder> orderOptional = vipOrderRepository.findByOrderNo(orderNo);
        if (!orderOptional.isPresent()) {
            return Result.error("订单不存在");
        }
        VipOrder order = orderOptional.get();
        if (order.getPaymentStatus() == 1) {
            return Result.success("支付已处理");
        }

        // 更新订单状态
        order.setPaymentStatus(1);
        vipOrderRepository.save(order);

        // 更新用户VIP权限
        Optional<SysAccount> accountOptional = sysAccountRepository.findById(order.getUserUid());
        if (accountOptional.isPresent()) {
            SysAccount account = accountOptional.get();
            if ("VIP基础版".equals(order.getPackageType())) {
                account.setIsVip(1);
            } else if ("SVIP专业版".equals(order.getPackageType())) {
                account.setIsSvip(1);
            }
            sysAccountRepository.save(account);
        }

        return Result.success("支付处理成功");
    }

    @Override
    public Result<java.util.Map<String, Object>> getVipOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("createTime").descending());
        
        // 简单实现过滤逻辑，实际可以根据 JPA Specification 做更复杂的动态查询
        Page<VipOrder> page;
        if (paymentStatus != null) {
            page = vipOrderRepository.findByPaymentStatus(paymentStatus, pageable);
        } else if ((orderNo != null && !orderNo.isEmpty()) || (userName != null && !userName.isEmpty())) {
            page = vipOrderRepository.findByOrderNoContainingOrUserNameContaining(orderNo != null ? orderNo : "", userName != null ? userName : "", pageable);
        } else {
            page = vipOrderRepository.findAll(pageable);
        }
        
        java.util.Map<String, Object> resultData = new java.util.HashMap<>();
        resultData.put("records", page.getContent());
        resultData.put("total", page.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        
        return Result.success(resultData);
    }
}
