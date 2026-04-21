package com.edu.javasb_back.service.impl;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.aliyun.teaopenapi.models.Config;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.service.SmsService;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SmsServiceImpl implements SmsService {

    private static final String SMS_CODE_CACHE_PREFIX = "sms:code:";
    private static final String SMS_SEND_LOCK_PREFIX = "sms:send:lock:";
    private static final long SMS_SEND_LOCK_SECONDS = 60L;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private RedisTemplate<Object, Object> redisTemplate;

    @Override
    public void sendVerificationCode(String phone) {
        validateSmsConfig();

        String sendLockKey = buildSendLockKey(phone);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(sendLockKey))) {
            throw new IllegalStateException("验证码发送过于频繁，请稍后再试");
        }

        String code = generateVerificationCode();
        try {
            SendSmsRequest request = new SendSmsRequest();
            request.setPhoneNumbers(phone);
            request.setSignName(globalConfigProperties.getAliyunSmsSignName());
            request.setTemplateCode(globalConfigProperties.getAliyunSmsTemplateCode());
            request.setTemplateParam(String.format("{\"code\":\"%s\"}", code));

            SendSmsResponse response = createClient().sendSms(request);
            if (response == null || response.getBody() == null) {
                throw new IllegalStateException("短信服务未返回有效结果");
            }

            String responseCode = response.getBody().getCode();
            if (!"OK".equalsIgnoreCase(responseCode)) {
                String message = response.getBody().getMessage();
                throw new IllegalStateException(StringUtils.hasText(message) ? message : "短信发送失败");
            }

            long expireMinutes = resolveCodeExpirationMinutes();
            redisTemplate.opsForValue().set(buildCodeCacheKey(phone), code, expireMinutes, TimeUnit.MINUTES);
            redisTemplate.opsForValue().set(sendLockKey, "1", SMS_SEND_LOCK_SECONDS, TimeUnit.SECONDS);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("短信发送失败: " + ex.getMessage(), ex);
        }
    }

    @Override
    public boolean verifyCode(String phone, String code) {
        if (!StringUtils.hasText(phone) || !StringUtils.hasText(code)) {
            return false;
        }
        Object cachedCode = redisTemplate.opsForValue().get(buildCodeCacheKey(phone));
        return code.equals(cachedCode == null ? null : cachedCode.toString());
    }

    @Override
    public void removeVerificationCode(String phone) {
        if (!StringUtils.hasText(phone)) {
            return;
        }
        redisTemplate.delete(buildCodeCacheKey(phone));
    }

    private Client createClient() throws Exception {
        Config config = new Config();
        config.setAccessKeyId(globalConfigProperties.getAliyunSmsAccessKeyId());
        config.setAccessKeySecret(globalConfigProperties.getAliyunSmsAccessKeySecret());
        config.setEndpoint(globalConfigProperties.getAliyunSmsEndpoint());
        return new Client(config);
    }

    private void validateSmsConfig() {
        if (!StringUtils.hasText(globalConfigProperties.getAliyunSmsAccessKeyId())
                || !StringUtils.hasText(globalConfigProperties.getAliyunSmsAccessKeySecret())) {
            throw new IllegalStateException("阿里云短信 AccessKey 未配置");
        }
        if (!StringUtils.hasText(globalConfigProperties.getAliyunSmsSignName())) {
            throw new IllegalStateException("阿里云短信签名未配置");
        }
        if (!StringUtils.hasText(globalConfigProperties.getAliyunSmsTemplateCode())) {
            throw new IllegalStateException("阿里云短信模板未配置");
        }
    }

    private String generateVerificationCode() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
    }

    private long resolveCodeExpirationMinutes() {
        Long configValue = globalConfigProperties.getAliyunSmsCodeExpirationMinutes();
        return configValue == null || configValue <= 0 ? 5L : configValue;
    }

    private String buildCodeCacheKey(String phone) {
        return SMS_CODE_CACHE_PREFIX + phone;
    }

    private String buildSendLockKey(String phone) {
        return SMS_SEND_LOCK_PREFIX + phone;
    }
}
