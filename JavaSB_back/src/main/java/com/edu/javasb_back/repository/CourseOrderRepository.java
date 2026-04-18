package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.CourseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseOrderRepository extends JpaRepository<CourseOrder, Long> {
    List<CourseOrder> findByUserUidAndPaymentStatus(Long userUid, Integer paymentStatus);
    List<CourseOrder> findByUserUidOrderByCreateTimeDesc(Long userUid);
    List<CourseOrder> findTop5ByOrderByCreateTimeDesc();
    Optional<CourseOrder> findByUserUidAndCourseIdAndPaymentStatus(Long userUid, String courseId, Integer paymentStatus);
    boolean existsByUserUidAndCourseIdAndPaymentStatus(Long userUid, String courseId, Integer paymentStatus);

    @Query(value = "SELECT co.*, sa.nickname as user_name, sa.phone as user_phone, c.title as course_title " +
            "FROM course_orders co " +
            "LEFT JOIN sys_accounts sa ON co.user_uid = sa.uid " +
            "LEFT JOIN courses c ON co.course_id = c.id " +
            "WHERE (:paymentStatus IS NULL OR co.payment_status = :paymentStatus) " +
            "AND (:orderNo IS NULL OR co.order_no LIKE CONCAT('%', :orderNo, '%')) " +
            "AND (:userName IS NULL OR sa.nickname LIKE CONCAT('%', :userName, '%')) " +
            "AND (:startTime IS NULL OR co.create_time >= :startTime) " +
            "AND (:endTime IS NULL OR co.create_time <= :endTime) " +
            "ORDER BY co.create_time DESC", 
            countQuery = "SELECT count(*) FROM course_orders co " +
                    "LEFT JOIN sys_accounts sa ON co.user_uid = sa.uid " +
                    "WHERE (:paymentStatus IS NULL OR co.payment_status = :paymentStatus) " +
                    "AND (:orderNo IS NULL OR co.order_no LIKE CONCAT('%', :orderNo, '%')) " +
                    "AND (:userName IS NULL OR sa.nickname LIKE CONCAT('%', :userName, '%')) " +
                    "AND (:startTime IS NULL OR co.create_time >= :startTime) " +
                    "AND (:endTime IS NULL OR co.create_time <= :endTime)",
            nativeQuery = true)
    Page<java.util.Map<String, Object>> findCourseOrdersWithDetails(@Param("orderNo") String orderNo, 
                                                                    @Param("userName") String userName, 
                                                                    @Param("paymentStatus") Integer paymentStatus, 
                                                                    @Param("startTime") java.time.LocalDateTime startTime,
                                                                    @Param("endTime") java.time.LocalDateTime endTime,
                                                                    Pageable pageable);

    @Query(value = "SELECT co.*, sa.nickname as user_name, sa.phone as user_phone, c.title as course_title " +
            "FROM course_orders co " +
            "LEFT JOIN sys_accounts sa ON co.user_uid = sa.uid " +
            "LEFT JOIN courses c ON co.course_id = c.id " +
            "WHERE (:paymentStatus IS NULL OR co.payment_status = :paymentStatus) " +
            "AND (:orderNo IS NULL OR co.order_no LIKE CONCAT('%', :orderNo, '%')) " +
            "AND (:userName IS NULL OR sa.nickname LIKE CONCAT('%', :userName, '%')) " +
            "AND (:startTime IS NULL OR co.create_time >= :startTime) " +
            "AND (:endTime IS NULL OR co.create_time <= :endTime) " +
            "ORDER BY co.create_time DESC",
            nativeQuery = true)
    List<java.util.Map<String, Object>> findCourseOrdersWithDetailsForExport(@Param("orderNo") String orderNo,
                                                                             @Param("userName") String userName,
                                                                             @Param("paymentStatus") Integer paymentStatus,
                                                                             @Param("startTime") java.time.LocalDateTime startTime,
                                                                             @Param("endTime") java.time.LocalDateTime endTime);
}
