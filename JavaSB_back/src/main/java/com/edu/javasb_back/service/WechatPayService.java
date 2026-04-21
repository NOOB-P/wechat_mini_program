package com.edu.javasb_back.service;

import java.math.BigDecimal;
import java.util.Map;

import com.wechat.pay.java.service.payments.model.Transaction;

public interface WechatPayService {

    Map<String, Object> createJsapiPayParams(String orderNo, String description, BigDecimal amount, String openid, String attach);

    Map<String, Object> createVirtualPaymentParams(String orderNo, String goodsId, BigDecimal amount, Long userUid);

    boolean verifyVirtualPaymentSecurity(String orderNo, String goodsId, BigDecimal amount, Long userUid,
                                         String timestamp, String nonceStr, String signature);

    Transaction parseTransactionNotification(String serialNumber, String timestamp, String nonce, String signature, String body);
}
