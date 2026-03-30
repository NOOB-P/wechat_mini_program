package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SysAccountRepository extends JpaRepository<SysAccount, Long> {
    Optional<SysAccount> findByPhone(String phone);
    Optional<SysAccount> findByUsername(String username);
    boolean existsByPhone(String phone);
    boolean existsByUsername(String username);
}
