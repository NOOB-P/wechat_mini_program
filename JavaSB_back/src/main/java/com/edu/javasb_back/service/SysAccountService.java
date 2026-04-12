package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.LoginVO;

public interface SysAccountService {
    Result<String> sendSmsCode(String phone);

    Result<LoginVO> adminLogin(AccountLoginDTO loginDTO);

    Result<java.util.List<com.edu.javasb_back.model.entity.SysRole>> getLoginRoles();

    Result<LoginVO> appLoginByPassword(AccountLoginDTO loginDTO);

    Result<LoginVO> loginByPhone(AccountLoginDTO loginDTO);

    Result<LoginVO> loginByWechat(String code);

    Result<LoginVO> bindWechatPhone(AccountLoginDTO loginDTO);

    Result<SysAccount> getUserInfo(Long uid);

    Result<SysAccount> getUserInfoByUsername(String username);

    Result<Void> logout(String token);

    Result<Void> updateBasicInfo(Long uid, AccountUpdateDTO updateDTO);

    Result<Void> updatePassword(Long uid, String oldPassword, String newPassword);

    Result<Void> bindStudent(Long uid, String studentName, String studentNo);

    Result<Void> bindStudentById(Long uid, String studentId);

    Result<Void> unbindStudentByParentUid(Long uid);
}
