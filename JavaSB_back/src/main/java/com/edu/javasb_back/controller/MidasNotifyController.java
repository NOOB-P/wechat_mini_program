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

/**
 * 微信虚拟支付 (米大师) 回调通知控制器
 */
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
        log.info("收到米大师虚拟支付回调通知: {}", body);

        Map<String, Object> response = new HashMap<>();

        try {
            // 1. 校验必填参数
            String outTradeNo = (String) body.get("out_trade_no");
            String paySig = (String) body.get("pay_sig");
            if (outTradeNo == null || paySig == null) {
                log.error("米大师回调参数缺失: out_trade_no={}, pay_sig={}", outTradeNo, paySig);
                response.put("errcode", 1001);
                response.put("errmsg", "params missing");
                return response;
            }

            // 2. 校验签名
            if (!verifyMidasSign(body)) {
                log.error("米大师回调签名校验失败: {}", outTradeNo);
                response.put("errcode", 1001);
                response.put("errmsg", "signature error");
                return response;
            }

            // 3. 处理业务逻辑 (发货)
            if (outTradeNo.startsWith("VOD")) {
                vipOrderService.paySuccessCallback(outTradeNo);
            } else if (outTradeNo.startsWith("COD")) {
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

    /**
     * 校验米大师回调签名
     * 算法: hmac_sha256(app_key, payload + "&" + uri)
     * payload 为所有请求参数按 key ASCII 排序拼接
     */
    private boolean verifyMidasSign(Map<String, Object> body) {
        String paySig = (String) body.get("pay_sig");
        
        // 排除 pay_sig 本身，对其他参数排序拼接
        Map<String, Object> params = new TreeMap<>(body);
        params.remove("pay_sig");
        
        String payload = params.entrySet().stream()
                .filter(e -> e.getValue() != null)
                .map(e -> e.getKey() + "=" + String.valueOf(e.getValue()))
                .collect(Collectors.joining("&"));
        
        String uri = wechatPayProperties.getVirtualPayment().getNotifyUrl();
        String appKey = wechatPayProperties.getVirtualPayment().getAppSecret();
        
        String expectedSig = VirtualPaymentSignatureUtils.midasPaySig(payload, uri, appKey);
        return VirtualPaymentSignatureUtils.secureEquals(expectedSig, paySig);
    }
}
