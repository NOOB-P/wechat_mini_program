package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SysAccountRepository extends JpaRepository<SysAccount, Long> {
    Optional<SysAccount> findByPhone(String phone);
    Optional<SysAccount> findByUsername(String username);
    boolean existsByPhone(String phone);
    boolean existsByUsername(String username);

    @Query("SELECT a FROM SysAccount a WHERE " +
           "(:username IS NULL OR a.username LIKE %:username%) AND " +
           "(:phone IS NULL OR a.phone LIKE %:phone%) AND " +
           "(:roleId IS NULL OR a.roleId = :roleId)")
    Page<SysAccount> findAccounts(@Param("username") String username, 
                                  @Param("phone") String phone, 
                                  @Param("roleId") Integer roleId, 
                                  Pageable pageable);
}
