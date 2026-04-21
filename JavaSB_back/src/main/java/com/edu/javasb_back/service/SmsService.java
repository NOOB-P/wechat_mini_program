package com.edu.javasb_back.service;

public interface SmsService {

    void sendVerificationCode(String phone);

    boolean verifyCode(String phone, String code);

    void removeVerificationCode(String phone);
}
