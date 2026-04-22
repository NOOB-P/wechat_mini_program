package com.edu.javasb_back.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.config.WechatPayProperties;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.utils.VirtualPaymentSignatureUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/pay/midas")
public class MidasNotifyController {

    @Autowired
    private WechatPayProperties wechatPayProperties;

    @Autowired
    private VipOrderService vipOrderService;

    @Autowired
    private CourseOrderService courseOrderService;

    @PostMapping("/notify")
    public Map<String, Object> handleNotify(@RequestBody Map<String, Object> body) {
        log.info("收到米大师虚拟支付回调: {}", body);

        Map<String, Object> response = new HashMap<>();

        try {
            String outTradeNo = asString(body.get("out_trade_no"));
            String paySig = asString(body.get("pay_sig"));
            if (!hasText(outTradeNo) || !hasText(paySig)) {
                log.error("米大师回调参数缺失: out_trade_no={}, pay_sig={}", outTradeNo, paySig);
                response.put("errcode", 1001);
                response.put("errmsg", "params missing");
                return response;
            }

            if (!verifyMidasSign(body, paySig)) {
                log.error("米大师回调验签失败: {}", outTradeNo);
                response.put("errcode", 1001);
                response.put("errmsg", "signature error");
                return response;
            }

            if (outTradeNo.startsWith("VOD")) {
                vipOrderService.paySuccessCallback(outTradeNo);
            } else if (outTradeNo.startsWith("C")) {
                courseOrderService.paySuccess(outTradeNo);
            } else {
                log.warn("未知的虚拟支付订单前缀: {}", outTradeNo);
            }

            response.put("errcode", 0);
            response.put("errmsg", "ok");
            return response;
        } catch (Exception e) {
            log.error("处理米大师回调异常", e);
            response.put("errcode", 500);
            response.put("errmsg", "system error");
            return response;
        }
    }

    private boolean verifyMidasSign(Map<String, Object> body, String paySig) {
        String currentAppKey = wechatPayProperties.getVirtualPayment().getAppSecret();
        
        // 回调请求的 uri，不包含 query_string
        String uri = "/api/pay/midas/notify";

        Map<String, Object> params = new TreeMap<>(body);
        params.remove("pay_sig");

        String postBody = params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && hasText(String.valueOf(entry.getValue())))
                .map(entry -> entry.getKey() + "=" + String.valueOf(entry.getValue()))
                .collect(Collectors.joining("&"));

        // 算法: pay_sig = hmac_sha256(appKey, uri + '&' + post_body)
        String needSignMsg = uri + "&" + postBody;
        String expectedSig = VirtualPaymentSignatureUtils.sign(needSignMsg, currentAppKey);
        
        log.info("--- 米大师回调验签详情 ---");
        log.info("URI: {}", uri);
        log.info("PostBody: {}", postBody);
        log.info("NeedSignMsg: {}", needSignMsg);
        log.info("AppKey: {}", currentAppKey);
        log.info("ExpectedSig: {}", expectedSig);
        log.info("ReceivedPaySig: {}", paySig);
        log.info("--------------------------");
        
        return VirtualPaymentSignatureUtils.secureEquals(expectedSig, paySig);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }
}
