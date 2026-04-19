package com.edu.javasb_back.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.service.WechatPayService;
import com.wechat.pay.java.service.payments.model.Transaction;

@RestController
@RequestMapping("/api/pay/wechat")
public class PayNotifyController {

    @Autowired
    private WechatPayService wechatPayService;

    @Autowired
    private CourseOrderService courseOrderService;

    @Autowired
    private VipOrderService vipOrderService;

    @PostMapping("/notify")
    public ResponseEntity<Map<String, String>> notify(
            @RequestHeader("Wechatpay-Serial") String serialNumber,
            @RequestHeader("Wechatpay-Timestamp") String timestamp,
            @RequestHeader("Wechatpay-Nonce") String nonce,
            @RequestHeader("Wechatpay-Signature") String signature,
            @RequestBody String body) {
        try {
            Transaction transaction = wechatPayService.parseTransactionNotification(serialNumber, timestamp, nonce, signature, body);
            if (transaction == null || transaction.getTradeState() != Transaction.TradeStateEnum.SUCCESS) {
                return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "忽略非成功支付通知"));
            }

            String orderNo = transaction.getOutTradeNo();
            if (orderNo != null && orderNo.startsWith("C")) {
                courseOrderService.paySuccess(orderNo);
            } else if (orderNo != null && orderNo.startsWith("VOD")) {
                vipOrderService.paySuccessCallback(orderNo);
            } else {
                throw new IllegalArgumentException("未知订单号: " + orderNo);
            }

            return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "成功"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("code", "FAIL", "message", "处理失败"));
        }
    }
}
