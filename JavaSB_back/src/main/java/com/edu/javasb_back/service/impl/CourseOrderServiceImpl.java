package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;
import com.edu.javasb_back.repository.CourseOrderRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.service.CourseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.stream.Collectors;

@Service
public class CourseOrderServiceImpl implements CourseOrderService {

    @Autowired
    private CourseOrderRepository orderRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysNotificationRepository notificationRepository;

    @Override
    @Transactional
    public CourseOrder createOrder(Long userUid, String courseId) {
        // 检查是否已购买
        if (isCoursePurchased(userUid, courseId)) {
            throw new RuntimeException("该课程已购买，无需重复下单");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("课程不存在"));

        // 检查价格
        if (course.getPrice() == null || course.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("免费课程无需购买，请直接学习");
        }

        // 创建订单
        CourseOrder order = new CourseOrder();
        order.setOrderNo("C" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUserUid(userUid);
        order.setCourseId(courseId);
        order.setPrice(course.getPrice());
        order.setPaymentStatus(0); // 待支付
        
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void paySuccess(String orderNo) {
        orderRepository.findAll().stream()
                .filter(o -> o.getOrderNo().equals(orderNo))
                .findFirst()
                .ifPresent(order -> {
                    order.setPaymentStatus(1); // 已支付
                    order.setPaymentMethod("模拟支付");
                    orderRepository.save(order);
                    
                    // 增加课程购买人数
                    courseRepository.findById(order.getCourseId()).ifPresent(course -> {
                        course.setBuyers((course.getBuyers() == null ? 0 : course.getBuyers()) + 1);
                        courseRepository.save(course);

                        // 发送购买成功通知
                        com.edu.javasb_back.model.entity.SysNotification notification = new com.edu.javasb_back.model.entity.SysNotification();
                        notification.setTitle("课程购买成功");
                        notification.setContent("您已成功购买课程《" + course.getTitle() + "》，现在可以开始学习啦！");
                        notification.setCategory("SYSTEM");
                        notification.setLevel("info");
                        notification.setTargetType(1); // 指定用户
                        notification.setTargetUid(order.getUserUid());
                        notification.setIsPublished(1);
                        notification.setActionText("去学习");
                        notification.setActionPath("/subpkg_course/pages/course/detail?id=" + course.getId());
                        notificationRepository.save(notification);
                    });
                });
    }

    @Override
    public boolean isCoursePurchased(Long userUid, String courseId) {
        return orderRepository.existsByUserUidAndCourseIdAndPaymentStatus(userUid, courseId, 1);
    }

    @Override
    public List<Course> getPurchasedCourses(Long userUid) {
        List<CourseOrder> orders = orderRepository.findByUserUidAndPaymentStatus(userUid, 1);
        if (orders.isEmpty()) {
            return List.of();
        }
        List<String> courseIds = orders.stream().map(CourseOrder::getCourseId).collect(Collectors.toList());
        
        return courseRepository.findAllByIdSql(courseIds);
    }

    @Override
    public com.edu.javasb_back.common.Result<Map<String, Object>> getCourseOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus, String startDate, String endDate) {
        Page<Map<String, Object>> page = orderRepository.findCourseOrdersWithDetails(
                normalizeKeyword(orderNo),
                normalizeKeyword(userName),
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                PageRequest.of(current - 1, size)
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", page.getContent());
        result.put("total", page.getTotalElements());
        result.put("current", current);
        result.put("size", size);
        
        return com.edu.javasb_back.common.Result.success(result);
    }

    @Override
    public List<Map<String, Object>> getCourseOrderExportList(String orderNo, String userName, Integer paymentStatus, String startDate, String endDate) {
        return orderRepository.findCourseOrdersWithDetailsForExport(
                normalizeKeyword(orderNo),
                normalizeKeyword(userName),
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate)
        );
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
    }

    private LocalDateTime parseStartDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return LocalDate.parse(value.trim()).atStartOfDay();
    }

    private LocalDateTime parseEndDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return LocalDate.parse(value.trim()).atTime(LocalTime.MAX);
    }
}
