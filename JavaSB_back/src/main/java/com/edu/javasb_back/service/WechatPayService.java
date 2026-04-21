package com.edu.javasb_back.service;

import java.math.BigDecimal;
import java.util.Map;

import com.wechat.pay.java.service.payments.model.Transaction;

public interface WechatPayService {

    Map<String, Object> createJsapiPayParams(String orderNo, String description, BigDecimal amount, String openid, String attach);

    Transaction parseTransactionNotification(String serialNumber, String timestamp, String nonce, String signature, String body);
}
