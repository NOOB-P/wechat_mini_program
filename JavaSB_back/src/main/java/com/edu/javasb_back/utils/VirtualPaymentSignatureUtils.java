package com.edu.javasb_back.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class VirtualPaymentSignatureUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String REQUEST_VIRTUAL_PAYMENT = "requestVirtualPayment";

    private VirtualPaymentSignatureUtils() {
    }

    public static String buildNonceStr() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String buildPayload(Map<String, ?> data) {
        return new TreeMap<>(data).entrySet().stream()
                .filter(entry -> entry.getValue() != null && !String.valueOf(entry.getValue()).isEmpty())
                .map(entry -> entry.getKey() + "=" + String.valueOf(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    /**
     * 小程序虚拟支付签名
     * 算法: hmac_sha256(app_key, signData)
     */
    public static String midasPaySig(String signData, String appKey) {
        return sign(REQUEST_VIRTUAL_PAYMENT + "&" + signData, appKey);
    }

    public static String midasSignature(String signData, String sessionKey) {
        return sign(signData, sessionKey);
    }

    public static String sign(String payload, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(keySpec);
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return toHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("生成虚拟支付签名失败", e);
        }
    }

    public static boolean secureEquals(String source, String target) {
        if (source == null || target == null) {
            return false;
        }
        return MessageDigest.isEqual(
                source.getBytes(StandardCharsets.UTF_8),
                target.getBytes(StandardCharsets.UTF_8));
    }

    private static String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte current : bytes) {
            builder.append(String.format("%02x", current));
        }
        return builder.toString();
    }
}
