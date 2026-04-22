package com.edu.javasb_back.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wechat.pay")
public class WechatPayProperties {

    private String appid;
    private String mchid;
    private String apiV3Key;
    private String privateKeyPath;
    private String publicKeyPath;
    private String publicKeyId;
    private String merchantSerialNumber;
    private String notifyUrl;
    private VirtualPayment virtualPayment = new VirtualPayment();

    public String getAppid() {
        return appid;
    }

    public void setAppid(String appid) {
        this.appid = appid;
    }

    public String getMchid() {
        return mchid;
    }

    public void setMchid(String mchid) {
        this.mchid = mchid;
    }

    public String getApiV3Key() {
        return apiV3Key;
    }

    public void setApiV3Key(String apiV3Key) {
        this.apiV3Key = apiV3Key;
    }

    public String getPrivateKeyPath() {
        return privateKeyPath;
    }

    public void setPrivateKeyPath(String privateKeyPath) {
        this.privateKeyPath = privateKeyPath;
    }

    public String getPublicKeyPath() {
        return publicKeyPath;
    }

    public void setPublicKeyPath(String publicKeyPath) {
        this.publicKeyPath = publicKeyPath;
    }

    public String getPublicKeyId() {
        return publicKeyId;
    }

    public void setPublicKeyId(String publicKeyId) {
        this.publicKeyId = publicKeyId;
    }

    public String getMerchantSerialNumber() {
        return merchantSerialNumber;
    }

    public void setMerchantSerialNumber(String merchantSerialNumber) {
        this.merchantSerialNumber = merchantSerialNumber;
    }

    public String getNotifyUrl() {
        return notifyUrl;
    }

    public void setNotifyUrl(String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }

    public VirtualPayment getVirtualPayment() {
        return virtualPayment;
    }

    public void setVirtualPayment(VirtualPayment virtualPayment) {
        this.virtualPayment = virtualPayment;
    }

    public boolean isConfigured() {
        return hasText(appid)
                && hasText(mchid)
                && hasText(apiV3Key)
                && hasText(privateKeyPath)
                && hasText(publicKeyPath)
                && hasText(publicKeyId)
                && hasText(merchantSerialNumber)
                && hasText(notifyUrl);
    }

    public boolean isVirtualPaymentConfigured() {
        return virtualPayment != null
                && hasText(virtualPayment.getOfferId())
                && hasText(virtualPayment.getAppSecret())
                && hasText(virtualPayment.getSecurityKey());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public static class VirtualPayment {

        private String offerId;
        private String appSecret;
        private Integer env = 0;
        private String vipGoodsPrefix = "vip";
        private String courseGoodsPrefix = "course";
        private String securityKey;
        private Long ticketExpireSeconds = 900L;
        private String notifyUrl;

        public String getOfferId() {
            return offerId;
        }

        public void setOfferId(String offerId) {
            this.offerId = offerId;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }

        public Integer getEnv() {
            return env;
        }

        public void setEnv(Integer env) {
            this.env = env;
        }

        public String getVipGoodsPrefix() {
            return vipGoodsPrefix;
        }

        public void setVipGoodsPrefix(String vipGoodsPrefix) {
            this.vipGoodsPrefix = vipGoodsPrefix;
        }

        public String getCourseGoodsPrefix() {
            return courseGoodsPrefix;
        }

        public void setCourseGoodsPrefix(String courseGoodsPrefix) {
            this.courseGoodsPrefix = courseGoodsPrefix;
        }

        public String getSecurityKey() {
            return securityKey;
        }

        public void setSecurityKey(String securityKey) {
            this.securityKey = securityKey;
        }

        public Long getTicketExpireSeconds() {
            return ticketExpireSeconds;
        }

        public void setTicketExpireSeconds(Long ticketExpireSeconds) {
            this.ticketExpireSeconds = ticketExpireSeconds;
        }

        public String getNotifyUrl() {
            return notifyUrl;
        }

        public void setNotifyUrl(String notifyUrl) {
            this.notifyUrl = notifyUrl;
        }
    }
}
