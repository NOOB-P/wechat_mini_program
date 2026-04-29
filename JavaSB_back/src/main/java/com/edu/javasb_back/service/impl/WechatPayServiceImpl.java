package com.edu.javasb_back.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.WechatBindRequiredException;
import com.edu.javasb_back.config.WechatPayProperties;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import com.edu.javasb_back.service.WechatPayService;
import com.edu.javasb_back.utils.VirtualPaymentSignatureUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wechat.pay.java.core.RSAPublicKeyConfig;
import com.wechat.pay.java.core.notification.NotificationParser;
import com.wechat.pay.java.core.notification.RequestParam;
import com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension;
import com.wechat.pay.java.service.payments.jsapi.model.Amount;
import com.wechat.pay.java.service.payments.jsapi.model.Payer;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayRequest;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayWithRequestPaymentResponse;
import com.wechat.pay.java.service.payments.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WechatPayServiceImpl implements WechatPayService {

    private static final Logger log = LoggerFactory.getLogger(WechatPayServiceImpl.class);

    private final Object initLock = new Object();

    @Autowired
    private WechatPayProperties wechatPayProperties;

    @Autowired
    private SysAccountRepository accountRepository;

    @Autowired
    private VipPricingRepository vipPricingRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    {
        // 确保生成紧凑的 JSON 字符串，没有多余的空格
        objectMapper.getFactory().configure(com.fasterxml.jackson.core.JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
    }

    private volatile RSAPublicKeyConfig config;
    private volatile JsapiServiceExtension jsapiServiceExtension;
    private volatile NotificationParser notificationParser;

    @Override
    public Map<String, Object> createJsapiPayParams(String orderNo, String description, BigDecimal amount,
                                                    String openid, String attach) {
        if (!StringUtils.hasText(orderNo)) {
            throw new IllegalArgumentException("订单号不能为空");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("支付金额必须大于 0");
        }
        if (!StringUtils.hasText(openid)) {
            throw new WechatBindRequiredException("微信 OpenID 未绑定");
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
    public Map<String, Object> createVirtualPaymentParams(String orderNo, String goodsId, BigDecimal amount, Long userUid) {
        if (!StringUtils.hasText(orderNo)) {
            throw new IllegalArgumentException("订单号不能为空");
        }
        if (!StringUtils.hasText(goodsId)) {
            throw new IllegalArgumentException("虚拟商品标识不能为空");
        }
        if (userUid == null) {
            throw new IllegalArgumentException("用户未登录");
        }

        String midasProductId = goodsId;
        BigDecimal finalAmount = amount;

        if (orderNo.startsWith("VOD")) {
            try {
                Optional<VipPricing> pricingOpt = vipPricingRepository.findById(Integer.valueOf(goodsId));
                if (pricingOpt.isPresent()) {
                    VipPricing pricing = pricingOpt.get();
                    if (StringUtils.hasText(pricing.getMidasProductId())) {
                        midasProductId = pricing.getMidasProductId();
                    }
                    finalAmount = pricing.getCurrentPrice();
                }
            } catch (NumberFormatException ignored) {
                // 如果 goodsId 不是数字（如 fallback 的拼接 ID），则保持默认
            }
        } else if (orderNo.startsWith("C")) {
            Optional<Course> courseOpt = courseRepository.findById(goodsId);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                if (StringUtils.hasText(course.getMidasProductId())) {
                    midasProductId = course.getMidasProductId();
                }
                finalAmount = course.getPrice();
            }
        }

        if (finalAmount == null || finalAmount.compareTo(BigDecimal.ZERO) == 0) {
            long timestamp = Instant.now().getEpochSecond();
            String nonceStr = VirtualPaymentSignatureUtils.buildNonceStr();
            String securityPayload = buildVirtualPayload(orderNo, goodsId, BigDecimal.ZERO, userUid, timestamp, nonceStr);
            String securityToken = VirtualPaymentSignatureUtils.sign(
                    securityPayload,
                    wechatPayProperties.getVirtualPayment().getSecurityKey());

            Map<String, Object> result = new HashMap<>();
            result.put("paymentType", "FREE");
            result.put("message", "免费商品直接下单");
            result.put("security", Map.of(
                    "timestamp", String.valueOf(timestamp),
                    "nonceStr", nonceStr,
                    "signature", securityToken,
                    "confirmSignature", securityToken
            ));
            return result;
        }

        if (!wechatPayProperties.isVirtualPaymentConfigured()) {
            throw new IllegalStateException("微信虚拟支付配置不完整，请检查 wechat.pay.virtual-payment.*");
        }

        SysAccount account = accountRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        String openid = account.getWxid();
        if (!StringUtils.hasText(openid)) {
            throw new WechatBindRequiredException("用户未绑定微信，无法发起虚拟支付");
        }

        String sessionKey = stringRedisTemplate.opsForValue().get("wechat:session_key:" + openid);
        if (!StringUtils.hasText(sessionKey)) {
            throw new WechatBindRequiredException("用户未绑定微信会话密钥，无法发起虚拟支付");
        }

        // 使用 LinkedHashMap 确保 signData 字段顺序严格按照：offerId, buyQuantity, env, currencyType, productId, goodsPrice, outTradeNo, attach
        Map<String, Object> signDataMap = new LinkedHashMap<>();
        signDataMap.put("offerId", wechatPayProperties.getVirtualPayment().getOfferId());
        signDataMap.put("buyQuantity", 1);
        signDataMap.put("env", wechatPayProperties.getVirtualPayment().getEnv());
        signDataMap.put("currencyType", "CNY");
        signDataMap.put("productId", midasProductId);
        signDataMap.put("goodsPrice", convertToFen(finalAmount));
        signDataMap.put("outTradeNo", orderNo);
        signDataMap.put("attach", "userUid=" + userUid);
        String mode = "short_series_goods";

        String signData;
        try {
            signData = objectMapper.writeValueAsString(signDataMap);
        } catch (Exception e) {
            throw new IllegalStateException("序列化 signData 失败", e);
        }

        String currentAppKey = wechatPayProperties.getVirtualPayment().getAppSecret();

        String paySig = VirtualPaymentSignatureUtils.midasPaySig(signData, currentAppKey);
        String signature = VirtualPaymentSignatureUtils.midasSignature(signData, sessionKey);

        log.info("--- 微信虚拟支付参数生成详情 ---");
        log.info("订单号: {}", orderNo);
        log.info("商品ID: {}", goodsId);
        log.info("支付金额: {} 元", finalAmount);
        log.info("signData (紧凑JSON): {}", signData);
        log.info("HMAC-SHA256 AppKey (用于签名): {}", currentAppKey);
        log.info("HMAC-SHA256 SessionKey: {}", sessionKey);
        log.info("生成的 paySig: {}", paySig);
        log.info("生成的 signature: {}", signature);
        log.info("------------------------------");

        long timestamp = Instant.now().getEpochSecond();
        String nonceStr = VirtualPaymentSignatureUtils.buildNonceStr();
        String securityPayload = buildVirtualPayload(orderNo, goodsId, finalAmount, userUid, timestamp, nonceStr);
        String securityToken = VirtualPaymentSignatureUtils.sign(
                securityPayload,
                wechatPayProperties.getVirtualPayment().getSecurityKey());

        Map<String, Object> result = new HashMap<>();
        result.put("paymentType", "VIRTUAL");
        result.put("payParams", Map.of(
                "signData", signData,
                "paySig", paySig,
                "signature", signature,
                "mode", mode
        ));
        result.put("security", Map.of(
                "timestamp", String.valueOf(timestamp),
                "nonceStr", nonceStr,
                "signature", securityToken,
                "confirmSignature", securityToken
        ));
        return result;
    }

    @Override
    public boolean verifyVirtualPaymentSecurity(String orderNo, String goodsId, BigDecimal amount, Long userUid,
                                                String timestamp, String nonceStr, String signature) {
        if (!wechatPayProperties.isVirtualPaymentConfigured()
                || !StringUtils.hasText(orderNo)
                || !StringUtils.hasText(goodsId)
                || amount == null
                || userUid == null
                || !StringUtils.hasText(timestamp)
                || !StringUtils.hasText(nonceStr)
                || !StringUtils.hasText(signature)) {
            return false;
        }

        long issuedAt;
        try {
            issuedAt = Long.parseLong(timestamp);
        } catch (NumberFormatException ex) {
            return false;
        }

        Long expireSeconds = wechatPayProperties.getVirtualPayment().getTicketExpireSeconds();
        if (expireSeconds != null && expireSeconds > 0) {
            long now = Instant.now().getEpochSecond();
            if (now - issuedAt > expireSeconds) {
                return false;
            }
        }

        String payload = buildVirtualPayload(orderNo, goodsId, amount, userUid, issuedAt, nonceStr);
        String expectedSignature = VirtualPaymentSignatureUtils.sign(
                payload,
                wechatPayProperties.getVirtualPayment().getSecurityKey());
        return VirtualPaymentSignatureUtils.secureEquals(expectedSignature, signature);
    }

    @Override
    public Transaction parseTransactionNotification(String serialNumber, String timestamp, String nonce,
                                                    String signature, String body) {
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
                throw new IllegalStateException("微信支付配置不完整，请检查 wechat.pay.*");
            }

            try {
                ClassPathResource privateResource = new ClassPathResource(wechatPayProperties.getPrivateKeyPath());
                byte[] privateKeyBytes = FileCopyUtils.copyToByteArray(privateResource.getInputStream());
                String privateKey = new String(privateKeyBytes, StandardCharsets.UTF_8);

                ClassPathResource publicResource = new ClassPathResource(wechatPayProperties.getPublicKeyPath());
                byte[] publicKeyBytes = FileCopyUtils.copyToByteArray(publicResource.getInputStream());
                String publicKey = new String(publicKeyBytes, StandardCharsets.UTF_8);

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

    private String buildVirtualPayload(String orderNo, String goodsId, BigDecimal amount, Long userUid,
                                       long timestamp, String nonceStr) {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", amount.setScale(2, RoundingMode.HALF_UP).toPlainString());
        data.put("goodsId", goodsId);
        data.put("nonceStr", nonceStr);
        data.put("orderNo", orderNo);
        data.put("timestamp", timestamp);
        data.put("userUid", userUid);
        return VirtualPaymentSignatureUtils.buildPayload(data);
    }
}
