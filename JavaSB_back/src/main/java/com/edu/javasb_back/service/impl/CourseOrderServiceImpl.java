package com.edu.javasb_back.service.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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
import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.repository.CourseOrderRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.SysNotificationService;
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

    @Autowired
    private SysNotificationService notificationService;

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
        CourseOrder savedOrder = orderRepository.save(order);

        // 发送通知给家长
        SysNotification notification = new SysNotification();
        notification.setTitle("课程待支付提醒");
        notification.setContent("您的孩子发起了课程《" + course.getTitle() + "》的购买申请，请在10分钟内完成支付。");
        notification.setPublisher("系统通知");
        notification.setTargetUid(userUid);
        notification.setIsPublished(1);
        notification.setCreateTime(LocalDateTime.now());
        notificationService.saveNotification(notification);

        return savedOrder;
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
        // 查询所有未删除且状态正常的订单（包含待支付和已支付）
        List<CourseOrder> orders = orderRepository.findByUserUidOrderByCreateTimeDesc(userUid);
        if (orders.isEmpty()) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        Map<String, CourseOrder> validOrderMap = new HashMap<>();
        List<String> courseIds = new ArrayList<>();

        for (CourseOrder order : orders) {
            // 已支付订单
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
                validOrderMap.put(order.getCourseId(), order);
                courseIds.add(order.getCourseId());
            } 
            // 待支付订单，需检查是否在10分钟内
            else if (order.getPaymentStatus() != null && order.getPaymentStatus() == 0) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isAfter(now)) {
                    // 如果同一个课程有多个订单，优先保留已支付的，或者最新的待支付订单
                    if (!validOrderMap.containsKey(order.getCourseId())) {
                        validOrderMap.put(order.getCourseId(), order);
                        courseIds.add(order.getCourseId());
                    }
                }
            }
        }

        if (courseIds.isEmpty()) {
            return List.of();
        }

        List<Course> courses = courseRepository.findAllByIdSql(courseIds);
        
        // 设置 transient 字段
        for (Course course : courses) {
            CourseOrder order = validOrderMap.get(course.getId());
            if (order != null) {
                course.setOrderNo(order.getOrderNo());
                course.setPaymentStatus(order.getPaymentStatus());
                course.setOrderCreateTime(order.getCreateTime());
                course.setIsPurchased(order.getPaymentStatus() == 1);
                // 确保价格信息也能传给前端用于支付
                if (order.getPaymentStatus() == 0) {
                    course.setPrice(order.getPrice());
                }
            }
        }

        // 按订单时间降序排序
        courses.sort((a, b) -> b.getOrderCreateTime().compareTo(a.getOrderCreateTime()));

        return courses;
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

        List<Map<String, Object>> records = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (Map<String, Object> record : page.getContent()) {
            Map<String, Object> newRecord = new HashMap<>(record);
            Object createTimeObj = newRecord.get("create_time");
            Object statusObj = newRecord.get("payment_status");
            
            if (statusObj instanceof Number status && status.intValue() == 0 && createTimeObj != null) {
                LocalDateTime createTime = null;
                if (createTimeObj instanceof LocalDateTime ldt) {
                    createTime = ldt;
                } else if (createTimeObj instanceof java.sql.Timestamp ts) {
                    createTime = ts.toLocalDateTime();
                } else if (createTimeObj instanceof java.util.Date date) {
                    createTime = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                }
                
                if (createTime != null && createTime.plusMinutes(10).isBefore(now)) {
                    newRecord.put("payment_status", -1); // -1 表示已过期
                }
            }
            records.add(newRecord);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", page.getTotalElements());
        result.put("current", current);
        result.put("size", size);
        return Result.success(result);
    }

    @Override
    public List<Map<String, Object>> getCourseOrderExportList(String orderNo, String userName, Integer paymentStatus, String startDate, String endDate) {
        List<Map<String, Object>> list = orderRepository.findCourseOrdersWithDetailsForExport(
                normalizeKeyword(orderNo),
                normalizeKeyword(userName),
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate)
        );
        
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (Map<String, Object> record : list) {
            Map<String, Object> newRecord = new HashMap<>(record);
            Object createTimeObj = newRecord.get("create_time");
            Object statusObj = newRecord.get("payment_status");
            
            if (statusObj instanceof Number status && status.intValue() == 0 && createTimeObj != null) {
                LocalDateTime createTime = null;
                if (createTimeObj instanceof LocalDateTime ldt) {
                    createTime = ldt;
                } else if (createTimeObj instanceof java.sql.Timestamp ts) {
                    createTime = ts.toLocalDateTime();
                } else if (createTimeObj instanceof java.util.Date date) {
                    createTime = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                }
                
                if (createTime != null && createTime.plusMinutes(10).isBefore(now)) {
                    newRecord.put("payment_status", -1); // -1 表示已过期
                }
            }
            result.add(newRecord);
        }
        return result;
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
