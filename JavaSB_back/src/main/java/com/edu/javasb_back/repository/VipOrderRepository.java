package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.VipOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VipOrderRepository extends JpaRepository<VipOrder, Long> {
    Optional<VipOrder> findByOrderNo(String orderNo);
    List<VipOrder> findByUserUidOrderByCreateTimeDesc(Long userUid);

    @Query("SELECT v FROM VipOrder v WHERE " +
            "(:paymentStatus IS NULL OR v.paymentStatus = :paymentStatus) AND " +
            "(:orderNo IS NULL OR v.orderNo LIKE %:orderNo%) AND " +
            "(:userName IS NULL OR v.userName LIKE %:userName% OR v.userPhone LIKE %:userName%)")
    Page<VipOrder> findByFilters(@Param("orderNo") String orderNo,
                                 @Param("userName") String userName,
                                 @Param("paymentStatus") Integer paymentStatus,
                                 Pageable pageable);

    @Query("SELECT v FROM VipOrder v WHERE " +
            "(:paymentStatus IS NULL OR v.paymentStatus = :paymentStatus) AND " +
            "(:orderNo IS NULL OR v.orderNo LIKE %:orderNo%) AND " +
            "(:userName IS NULL OR v.userName LIKE %:userName% OR v.userPhone LIKE %:userName%)")
    List<VipOrder> findByFilters(@Param("orderNo") String orderNo,
                                 @Param("userName") String userName,
                                 @Param("paymentStatus") Integer paymentStatus,
                                 Sort sort);
}
