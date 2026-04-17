package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.PrintOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 打印订单仓库
 */
@Repository
public interface PrintOrderRepository extends JpaRepository<PrintOrder, Long> {
    List<PrintOrder> findByUserPhoneOrderByCreateTimeDesc(String userPhone);
    List<PrintOrder> findByUserNameOrderByCreateTimeDesc(String userName);
    
    /**
     * 根据订单号、用户名、订单状态分页查询
     */
    @Query("SELECT p FROM PrintOrder p WHERE " +
           "(:orderNo IS NULL OR p.orderNo LIKE %:orderNo%) AND " +
           "(:userName IS NULL OR p.userName LIKE %:userName% OR p.userPhone LIKE %:userName%) AND " +
           "(:orderStatus IS NULL OR p.orderStatus = :orderStatus)")
    Page<PrintOrder> findByParams(@Param("orderNo") String orderNo, 
                                 @Param("userName") String userName, 
                                 @Param("orderStatus") Integer orderStatus, 
                                 Pageable pageable);

    @Query("SELECT p FROM PrintOrder p WHERE " +
           "(:orderNo IS NULL OR p.orderNo LIKE %:orderNo%) AND " +
           "(:userName IS NULL OR p.userName LIKE %:userName% OR p.userPhone LIKE %:userName%) AND " +
           "(:orderStatus IS NULL OR p.orderStatus = :orderStatus)")
    List<PrintOrder> findByParams(@Param("orderNo") String orderNo,
                                  @Param("userName") String userName,
                                  @Param("orderStatus") Integer orderStatus,
                                  Sort sort);
}
