package com.edu.javasb_back.service.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.datasource.DataSourceName;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.repository.CourseOrderRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.WechatPayService;

@Service
@Transactional(readOnly = true)
public class CourseOrderServiceImpl implements CourseOrderService {

    private static final String WECHAT_PAYMENT_METHOD = "微信支付";

    @Autowired
    private CourseOrderRepository orderRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private WechatPayService wechatPayService;

    @Override
    @Transactional
    public CourseOrder createOrder(Long userUid, String courseId) {
        if (isCoursePurchased(userUid, courseId)) {
            throw new RuntimeException("该课程已购买，无需重复下单");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("课程不存在"));

        if (course.getPrice() == null || course.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("免费课程无需购买，请直接学习");
        }

        CourseOrder order = new CourseOrder();
        order.setOrderNo("C" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUserUid(userUid);
        order.setCourseId(courseId);
        order.setPrice(course.getPrice());
        order.setPaymentStatus(0);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void paySuccess(String orderNo) {
        Optional<CourseOrder> orderOptional = orderRepository.findByOrderNo(orderNo);
        if (orderOptional.isEmpty()) {
            return;
        }

        CourseOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return;
        }

        order.setPaymentStatus(1);
        order.setPaymentMethod(WECHAT_PAYMENT_METHOD);
        orderRepository.save(order);

        courseRepository.findById(order.getCourseId()).ifPresent(course -> {
            course.setBuyers((course.getBuyers() == null ? 0 : course.getBuyers()) + 1);
            courseRepository.save(course);
        });
    }

    @Override
    @DS(DataSourceName.MASTER)
    public Result<Map<String, Object>> createWechatPayParams(Long userUid, String orderNo) {
        if (!StringUtils.hasText(orderNo)) {
            return Result.error("订单号不能为空");
        }

        Optional<CourseOrder> orderOptional = orderRepository.findByOrderNoAndUserUid(orderNo, userUid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        CourseOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.error(400, "订单已支付");
        }

        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOptional.get();
        if (!StringUtils.hasText(account.getWxid())) {
            return Result.error(40101, "请先绑定微信后再发起支付");
        }

        Course course = courseRepository.findById(order.getCourseId()).orElse(null);
        if (course == null) {
            return Result.error("课程不存在");
        }

        try {
            Map<String, Object> payParams = wechatPayService.createJsapiPayParams(
                    order.getOrderNo(),
                    "课程购买-" + course.getTitle(),
                    order.getPrice(),
                    account.getWxid(),
                    "COURSE");
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", order.getOrderNo());
            result.put("payParams", payParams);
            return Result.success("获取支付参数成功", result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取支付参数失败: " + e.getMessage());
        }
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
    public Result<Map<String, Object>> getCourseOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus, String startDate, String endDate) {
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
        return Result.success(result);
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
