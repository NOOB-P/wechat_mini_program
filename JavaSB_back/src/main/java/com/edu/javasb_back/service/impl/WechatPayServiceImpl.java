package com.edu.javasb_back.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.config.WechatPayProperties;
import com.edu.javasb_back.service.WechatPayService;
import com.wechat.pay.java.core.RSAPublicKeyConfig;
import com.wechat.pay.java.core.notification.NotificationParser;
import com.wechat.pay.java.core.notification.RequestParam;
import com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension;
import com.wechat.pay.java.service.payments.jsapi.model.Amount;
import com.wechat.pay.java.service.payments.jsapi.model.Payer;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayRequest;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayWithRequestPaymentResponse;
import com.wechat.pay.java.service.payments.model.Transaction;

@Service
public class WechatPayServiceImpl implements WechatPayService {

    private final Object initLock = new Object();

    @Autowired
    private WechatPayProperties wechatPayProperties;

    private volatile RSAPublicKeyConfig config;
    private volatile JsapiServiceExtension jsapiServiceExtension;
    private volatile NotificationParser notificationParser;

    @Override
    public Map<String, Object> createJsapiPayParams(String orderNo, String description, BigDecimal amount, String openid, String attach) {
        if (!StringUtils.hasText(orderNo)) {
            throw new IllegalArgumentException("订单号不能为空");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("支付金额必须大于 0");
        }
        if (!StringUtils.hasText(openid)) {
            throw new IllegalArgumentException("微信 OpenID 未绑定");
        }

        ensureInitialized();

        Amount requestAmount = new Amount();
        requestAmount.setTotal(convertToFen(amount));
        requestAmount.setCurrency("CNY");

        Payer payer = new Payer();
        payer.setOpenid(openid);

        PrepayRequest request = new PrepayRequest();
        request.setAppid(wechatPayProperties.getAppid());
        request.setMchid(wechatPayProperties.getMchid());
        request.setDescription(truncate(description, 120));
        request.setOutTradeNo(orderNo);
        request.setNotifyUrl(wechatPayProperties.getNotifyUrl());
        // 微信支付要求 RFC3339 格式，且不能包含纳秒部分
        request.setTimeExpire(OffsetDateTime.now(ZoneOffset.ofHours(8))
                .plusMinutes(30)
                .truncatedTo(ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        request.setAmount(requestAmount);
        request.setPayer(payer);
        if (StringUtils.hasText(attach)) {
            request.setAttach(attach);
        }

        PrepayWithRequestPaymentResponse response = jsapiServiceExtension.prepayWithRequestPayment(request);
        Map<String, Object> result = new HashMap<>();
        result.put("appId", response.getAppId());
        result.put("timeStamp", response.getTimeStamp());
        result.put("nonceStr", response.getNonceStr());
        result.put("package", response.getPackageVal());
        result.put("signType", response.getSignType());
        result.put("paySign", response.getPaySign());
        return result;
    }

    @Override
    public Transaction parseTransactionNotification(String serialNumber, String timestamp, String nonce, String signature, String body) {
        ensureInitialized();

        RequestParam requestParam = new RequestParam.Builder()
                .serialNumber(serialNumber)
                .timestamp(timestamp)
                .nonce(nonce)
                .signature(signature)
                .body(body)
                .build();
        return notificationParser.parse(requestParam, Transaction.class);
    }

    private void ensureInitialized() {
        if (jsapiServiceExtension != null && notificationParser != null) {
            return;
        }
        synchronized (initLock) {
            if (jsapiServiceExtension != null && notificationParser != null) {
                return;
            }
            if (!wechatPayProperties.isConfigured()) {
                throw new IllegalStateException("微信支付配置不完整，请检查 wechat.pay.* 配置");
            }

            try {
                // 加载商户私钥
                ClassPathResource privResource = new ClassPathResource(wechatPayProperties.getPrivateKeyPath());
                byte[] privKeyBytes = FileCopyUtils.copyToByteArray(privResource.getInputStream());
                String privateKey = new String(privKeyBytes, StandardCharsets.UTF_8);

                // 加载微信支付公钥
                ClassPathResource pubResource = new ClassPathResource(wechatPayProperties.getPublicKeyPath());
                byte[] pubKeyBytes = FileCopyUtils.copyToByteArray(pubResource.getInputStream());
                String publicKey = new String(pubKeyBytes, StandardCharsets.UTF_8);

                config = new RSAPublicKeyConfig.Builder()
                        .merchantId(wechatPayProperties.getMchid())
                        .privateKey(privateKey)
                        .merchantSerialNumber(wechatPayProperties.getMerchantSerialNumber())
                        .publicKey(publicKey)
                        .publicKeyId(wechatPayProperties.getPublicKeyId())
                        .apiV3Key(wechatPayProperties.getApiV3Key())
                        .build();

                jsapiServiceExtension = new JsapiServiceExtension.Builder()
                        .config(config)
                        .build();
                notificationParser = new NotificationParser(config);
            } catch (Exception e) {
                throw new IllegalStateException("初始化微信支付配置失败: " + e.getMessage(), e);
            }
        }
    }

    private int convertToFen(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    private String truncate(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return "优题慧订单支付";
        }
        String normalized = value.trim();
        return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength);
    }
}
