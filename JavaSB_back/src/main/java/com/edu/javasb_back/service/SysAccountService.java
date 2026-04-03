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
     * 获取后台登录可选角色
     */
    Result<java.util.List<com.edu.javasb_back.model.entity.SysRole>> getLoginRoles();

    /**
     * 密码登录 (家长端)
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
    Result<Void> updatePassword(Long uid, String oldPassword, String newPassword);

    /**
     * 绑定学生账号
     * @param uid 家长用户UID
     * @param studentName 学生姓名
     * @param studentNo 学生学号/准考证号
     * @return 结果
     */
    Result<Void> bindStudent(Long uid, String studentName, String studentNo);

    /**
     * 绑定学生账号 (通过学生ID)
     * @param uid 家长用户UID
     * @param studentId 学生ID
     * @return 结果
     */
    Result<Void> bindStudentById(Long uid, String studentId);

    /**
     * 解绑学生账号 (通过家长UID)
     * @param uid 家长用户UID
     * @return 结果
     */
    Result<Void> unbindStudentByParentUid(Long uid);
}
