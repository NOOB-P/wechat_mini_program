package com.edu.javasb_back.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.common.WechatBindRequiredException;
import com.edu.javasb_back.config.WechatPayProperties;
import com.edu.javasb_back.config.datasource.DataSourceName;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;
import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.repository.CourseOrderRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.SysNotificationService;
import com.edu.javasb_back.service.WechatPayService;

@Service
@Transactional(readOnly = true)
public class CourseOrderServiceImpl implements CourseOrderService {

    private static final String WECHAT_PAYMENT_METHOD = "微信虚拟支付";
    private static final String PAYMENT_TYPE_VIRTUAL = "VIRTUAL";

    @Autowired
    private CourseOrderRepository orderRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private WechatPayService wechatPayService;

    @Autowired
    private WechatPayProperties wechatPayProperties;

    @Autowired
    private SysNotificationService notificationService;

    @Override
    @Transactional
    public Result<CourseOrder> createOrder(Long userUid, String courseId) {
        // 校验是否已购买或存在待支付订单
        List<CourseOrder> existingOrders = orderRepository.findByUserUidAndCourseId(userUid, courseId);
        for (CourseOrder order : existingOrders) {
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
                return Result.error(400, "该课程已购买，无需重复下单");
            }
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 0) {
                // 检查是否在10分钟有效期内
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isAfter(LocalDateTime.now())) {
                    return Result.error(400, "该课程已有一个待支付订单，请先支付或取消原订单");
                }
            }
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return Result.error(404, "课程不存在");
        }

        if (course.getPrice() == null || course.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return Result.error(400, "免费课程无需购买，请直接学习");
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
        notification.setCategory("course");
        notification.setLevel("warning");
        notification.setPublisher("系统通知");
        notification.setTargetUid(userUid);
        notification.setIsPublished(1);
        notification.setCreateTime(LocalDateTime.now());
        notification.setActionText("立即支付");

        notification.setActionPath("/subpkg_mine/pages/mine/order-list?tab=course");

        notificationService.saveNotification(notification);

        return Result.success(savedOrder);
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

        Course course = courseRepository.findById(order.getCourseId()).orElse(null);
        if (course == null) {
            return Result.error("课程不存在");
        }

        try {
            Map<String, Object> payPackage = wechatPayService.createVirtualPaymentParams(
                    order.getOrderNo(),
                    buildCourseGoodsId(order),
                    order.getPrice(),
                    userUid);
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", order.getOrderNo());
            result.put("paymentType", PAYMENT_TYPE_VIRTUAL);
            result.put("payParams", payPackage.get("payParams"));
            result.put("security", payPackage.get("security"));
            result.put("courseTitle", course.getTitle());
            return Result.success("获取支付参数成功", result);
        } catch (WechatBindRequiredException e) {
            return Result.wechatBindRequired(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取支付参数失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<String> confirmVirtualPayment(Long userUid, String orderNo, Map<String, Object> securityData) {
        if (!StringUtils.hasText(orderNo)) {
            return Result.error("订单号不能为空");
        }

        Optional<CourseOrder> orderOptional = orderRepository.findByOrderNoAndUserUid(orderNo, userUid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        CourseOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.success("支付已处理");
        }

        boolean valid = wechatPayService.verifyVirtualPaymentSecurity(
                orderNo,
                buildCourseGoodsId(order),
                order.getPrice(),
                userUid,
                asString(securityData == null ? null : securityData.get("timestamp")),
                asString(securityData == null ? null : securityData.get("nonceStr")),
                resolveSecuritySignature(securityData));
        if (!valid) {
            return Result.error(400, "虚拟支付校验失败");
        }

        paySuccess(orderNo);
        return Result.success("支付处理成功", null);
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
            // 已取消/已过期订单在小程序端不显示，此处不再放入 validOrderMap
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
    @Transactional
    public Result<Void> cancelOrder(Long userUid, String orderNo) {
        Optional<CourseOrder> orderOptional = orderRepository.findByOrderNoAndUserUid(orderNo, userUid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }
        CourseOrder order = orderOptional.get();
        if (order.getPaymentStatus() != 0) {
            return Result.error("只能取消待支付订单");
        }
        order.setPaymentStatus(2); // 2-已取消
        orderRepository.save(order);
        return Result.success("订单已取消", null);
    }

    @Override
    public Result<Map<String, Object>> getCourseOrderList(int current, int size, String orderNo, String userName,
                                                          Integer paymentStatus, String startDate, String endDate) {
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
        return !StringUtils.hasText(keyword) ? null : keyword.trim();
    }

    private LocalDateTime parseStartDateTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return LocalDate.parse(value.trim()).atStartOfDay();
    }

    private LocalDateTime parseEndDateTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return LocalDate.parse(value.trim()).atTime(LocalTime.MAX);
    }

    private String buildCourseGoodsId(CourseOrder order) {
        String prefix = wechatPayProperties.getVirtualPayment().getCourseGoodsPrefix();
        return normalizeGoodsSegment(prefix) + "-" + normalizeGoodsSegment(order.getCourseId());
    }

    private String normalizeGoodsSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "default";
        }
        String normalized = value.trim().replaceAll("[^0-9A-Za-z\\-]+", "-");
        normalized = normalized.replaceAll("-{2,}", "-");
        normalized = normalized.replaceAll("^-|-$", "");
        return normalized.toLowerCase();
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }

    private String resolveSecuritySignature(Map<String, Object> securityData) {
        if (securityData == null) {
            return "";
        }
        Object confirmSignature = securityData.get("confirmSignature");
        if (confirmSignature != null && StringUtils.hasText(confirmSignature.toString())) {
            return confirmSignature.toString();
        }
        return asString(securityData.get("signature"));
    }
}
