package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.LoginVO;

public interface SysAccountService {
    /**
     * 发送短信验证码
     */
    Result<String> sendSmsCode(String phone);

    /**
     * 后台管理端账号密码登录
     */
    Result<LoginVO> adminLogin(AccountLoginDTO loginDTO);

    /**
     * 小程序家长端手机号密码登录
     */
    Result<LoginVO> appLoginByPassword(AccountLoginDTO loginDTO);

    /**
     * 手机号验证码登录 (主要用于小程序家长端)
     */
    Result<LoginVO> loginByPhone(AccountLoginDTO loginDTO);
    
    /**
     * 获取当前用户信息
     */
    Result<SysAccount> getUserInfo(Long uid);

    /**
     * 根据用户名获取当前用户信息
     */
    Result<SysAccount> getUserInfoByUsername(String username);
    /**
     * 退出登录
     * @param token JWT Token
     * @return 结果
     */
    Result<Void> logout(String token);

    /**
     * 更新当前用户基本信息
     */
    Result<Void> updateBasicInfo(Long uid, AccountUpdateDTO updateDTO);

    /**
     * 修改密码
     */
    Result<Void> updatePassword(String username, String oldPassword, String newPassword);
}
