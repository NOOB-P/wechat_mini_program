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
    List<VipOrder> findTop5ByOrderByCreateTimeDesc();

    @Query("SELECT v FROM VipOrder v WHERE " +
            "(:paymentStatus IS NULL OR v.paymentStatus = :paymentStatus) AND " +
            "(:sourceType IS NULL OR v.sourceType = :sourceType) AND " +
            "(:keyword IS NULL OR v.orderNo LIKE %:keyword% OR v.userName LIKE %:keyword% OR v.userPhone LIKE %:keyword% OR v.schoolName LIKE %:keyword%) AND " +
            "(:startTime IS NULL OR v.createTime >= :startTime) AND " +
            "(:endTime IS NULL OR v.createTime <= :endTime)")
    Page<VipOrder> findByFilters(@Param("keyword") String keyword,
                                 @Param("sourceType") String sourceType,
                                 @Param("paymentStatus") Integer paymentStatus,
                                 @Param("startTime") java.time.LocalDateTime startTime,
                                 @Param("endTime") java.time.LocalDateTime endTime,
                                 Pageable pageable);

    @Query("SELECT v FROM VipOrder v WHERE " +
            "(:paymentStatus IS NULL OR v.paymentStatus = :paymentStatus) AND " +
            "(:sourceType IS NULL OR v.sourceType = :sourceType) AND " +
            "(:keyword IS NULL OR v.orderNo LIKE %:keyword% OR v.userName LIKE %:keyword% OR v.userPhone LIKE %:keyword% OR v.schoolName LIKE %:keyword%) AND " +
            "(:startTime IS NULL OR v.createTime >= :startTime) AND " +
            "(:endTime IS NULL OR v.createTime <= :endTime)")
    List<VipOrder> findByFilters(@Param("keyword") String keyword,
                                 @Param("sourceType") String sourceType,
                                 @Param("paymentStatus") Integer paymentStatus,
                                 @Param("startTime") java.time.LocalDateTime startTime,
                                 @Param("endTime") java.time.LocalDateTime endTime,
                                 Sort sort);
}
