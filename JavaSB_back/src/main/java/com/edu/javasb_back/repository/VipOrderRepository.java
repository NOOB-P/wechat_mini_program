package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VipOrderRepository extends JpaRepository<VipOrder, Long> {
    Optional<VipOrder> findByOrderNo(String orderNo);
    Page<VipOrder> findByOrderNoContainingOrUserNameContaining(String orderNo, String userName, Pageable pageable);
    Page<VipOrder> findByPaymentStatus(Integer paymentStatus, Pageable pageable);
}
