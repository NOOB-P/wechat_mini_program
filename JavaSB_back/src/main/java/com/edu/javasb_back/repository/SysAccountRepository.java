package com.edu.javasb_back.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.edu.javasb_back.model.entity.SysAccount;

@Repository
public interface SysAccountRepository extends JpaRepository<SysAccount, Long> {
    Optional<SysAccount> findByPhone(String phone);
    Optional<SysAccount> findByUsername(String username);
    boolean existsByPhone(String phone);
    boolean existsByUsername(String username);

    /**
     * 使用 SQL 原生语句根据 UID 查询用户信息
     */
    @Query(value = "SELECT * FROM sys_accounts WHERE uid = :uid", nativeQuery = true)
    Optional<SysAccount> findByUidSql(@Param("uid") Long uid);

    /**
     * 使用 SQL 原生语句更新基本信息
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE sys_accounts SET nickname = :nickname, phone = :phone, email = :email, avatar = :avatar, update_time = NOW() WHERE uid = :uid", nativeQuery = true)
    int updateBasicInfoSql(@Param("uid") Long uid, @Param("nickname") String nickname, @Param("phone") String phone, @Param("email") String email, @Param("avatar") String avatar);

    /**
     * 使用 SQL 原生语句更新密码
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE sys_accounts SET password = :password, update_time = NOW() WHERE uid = :uid", nativeQuery = true)
    int updatePasswordSql(@Param("uid") Long uid, @Param("password") String password);

    /**
     * 使用 SQL 原生语句更新登录状态和时间
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE sys_accounts SET last_login_time = NOW(), online_status = :status WHERE uid = :uid", nativeQuery = true)
    int updateLoginStatusSql(@Param("uid") Long uid, @Param("status") String status);

    /**
     * 使用 SQL 原生语句根据用户名查询用户信息
     */
    @Query(value = "SELECT * FROM sys_accounts WHERE username = :username", nativeQuery = true)
    Optional<SysAccount> findByUsernameSql(@Param("username") String username);

    /**
     * 使用 SQL 原生语句根据手机号查询用户信息
     */
    @Query(value = "SELECT * FROM sys_accounts WHERE phone = :phone", nativeQuery = true)
    Optional<SysAccount> findByPhoneSql(@Param("phone") String phone);

    /**
     * 使用 SQL 原生语句插入新账号 (自动注册时使用)
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO sys_accounts (username, password, nickname, phone, role_id, is_enabled, online_status, create_time, update_time) " +
                   "VALUES (:username, :password, :nickname, :phone, :roleId, :isEnabled, :onlineStatus, NOW(), NOW())", nativeQuery = true)
    int insertAccountSql(@Param("username") String username, @Param("password") String password, @Param("nickname") String nickname, 
                         @Param("phone") String phone, @Param("roleId") Integer roleId, @Param("isEnabled") Integer isEnabled, 
                         @Param("onlineStatus") String onlineStatus);

    @Query("SELECT a FROM SysAccount a WHERE " +
           "(:username IS NULL OR a.username LIKE %:username%) AND " +
           "(:phone IS NULL OR a.phone LIKE %:phone%) AND " +
           "(:roleId IS NULL OR a.roleId = :roleId)")
    Page<SysAccount> findAccounts(@Param("username") String username, 
                                  @Param("phone") String phone, 
                                  @Param("roleId") Integer roleId, 
                                  Pageable pageable);
}
