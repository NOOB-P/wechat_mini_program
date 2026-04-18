package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.AccountLoginDTO;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.LoginVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface SysAccountService {
    Result<String> sendSmsCode(String phone);

    Result<LoginVO> adminLogin(AccountLoginDTO loginDTO);

    Result<java.util.List<com.edu.javasb_back.model.entity.SysRole>> getLoginRoles();

    Result<LoginVO> appLoginByPassword(AccountLoginDTO loginDTO);

    Result<LoginVO> loginByPhone(AccountLoginDTO loginDTO);

    Result<LoginVO> loginByWechat(String code);

    Result<LoginVO> loginByWechatPhone(AccountLoginDTO loginDTO);

    Result<LoginVO> bindWechatPhone(AccountLoginDTO loginDTO);

    Result<SysAccount> getUserInfo(Long uid);

    Result<SysAccount> getUserInfoByUsername(String username);

    Result<Void> logout(String token);

    Result<Void> updateBasicInfo(Long uid, AccountUpdateDTO updateDTO);

    Result<Void> updatePassword(Long uid, String oldPassword, String newPassword);

    Result<Void> bindStudent(Long uid, String studentName, String studentNo);

    Result<Void> bindStudentById(Long uid, String studentId);

    Result<Void> unbindStudentByParentUid(Long uid);

    Result<Map<String, Object>> getAccountList(Long currentUid, int current, int size, String userName, String userPhone, Integer roleId, String schoolId, String classId);

    Result<Void> addAccount(Long currentUid, SysAccount account);

    Result<Map<String, Object>> importParents(Long currentUid, MultipartFile file);

    Result<Void> editAccount(Long operatorUid, Long uid, SysAccount updateData);
    Result<Void> deleteAccount(Long operatorUid, Long uid);
    Result<Void> batchDeleteAccounts(Long operatorUid, java.util.List<Long> uids);
}
