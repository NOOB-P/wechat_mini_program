package com.edu.javasb_back.service.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.*;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import com.edu.javasb_back.repository.VipOrderRepository;
import com.edu.javasb_back.service.SysNotificationService;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.service.WechatPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.WechatPayProperties;
import com.edu.javasb_back.config.datasource.DataSourceName;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.repository.VipOrderRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import com.edu.javasb_back.service.VipOrderService;
import com.edu.javasb_back.service.WechatPayService;

@Service
@Transactional(readOnly = true)
public class VipOrderServiceImpl implements VipOrderService {

    private static final String SOURCE_ONLINE_PURCHASE = "ONLINE_PURCHASE";
    private static final String SOURCE_SCHOOL_GIFT = "SCHOOL_GIFT";
    private static final String SCHOOL_PAYMENT_METHOD = "校讯通赠送";
    private static final String ONLINE_PAYMENT_METHOD = "微信虚拟支付";
    private static final String SCHOOL_VIP_PACKAGE = "VIP";
    private static final String PAYMENT_TYPE_VIRTUAL = "VIRTUAL";

    @Autowired
    private VipOrderRepository vipOrderRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private StudentParentBindingRepository studentParentBindingRepository;

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Autowired
    private VipPricingRepository vipPricingRepository;

    @Autowired
    private WechatPayService wechatPayService;

    @Autowired
<<<<<<< HEAD
    private WechatPayProperties wechatPayProperties;
=======
>>>>>>> b2e37d11db5c65cbbbcf3dbbcf15b49233c10115
    private SysNotificationService notificationService;

    @Override
    @Transactional
    public Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData) {
        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("用户不存在");
        }

        BigDecimal price = parsePrice(orderData.get("price"));
        if (price == null) {
            return Result.error("订单金额不能为空");
        }

        SysAccount account = accountOptional.get();
        VipOrder order = new VipOrder();
        order.setOrderNo(buildOrderNo());
        order.setUserUid(userUid);
        order.setUserName(resolveUserName(account));
        order.setUserPhone(resolveUserPhone(account));
        order.setSchoolName(resolveSchoolName(userUid));

        String tierCode = asString(orderData.get("tierCode"));
        String title = asString(orderData.get("packageType"));
        int months = resolveDurationMonths(orderData);
        if (months <= 0) {
            return Result.error(400, "会员套餐时长无效，请检查价格配置");
        }
        order.setPackageType(StringUtils.hasText(tierCode) ? tierCode : title);
        order.setPeriod(formatMonthPeriod(months));
        order.setPrice(price);
        order.setPaymentStatus(0);
        order.setPaymentMethod(ONLINE_PAYMENT_METHOD);
        order.setSourceType(SOURCE_ONLINE_PURCHASE);

        VipOrder savedOrder = vipOrderRepository.save(order);

        // 发送通知给家长
        SysNotification notification = new SysNotification();
        notification.setTitle("会员充值待支付提醒");
        notification.setContent("您的孩子发起了会员充值申请（" + order.getPackageType() + " " + order.getPeriod() + "），请在10分钟内完成支付。");
        notification.setPublisher("系统通知");
        notification.setTargetUid(userUid);
        notification.setIsPublished(1);
        notification.setCreateTime(LocalDateTime.now());
        notificationService.saveNotification(notification);

        return Result.success(savedOrder);
    }

    @Override
    public Result<List<VipOrder>> getMyVipOrders(Long userUid) {
        List<VipOrder> orders = vipOrderRepository.findByUserUidOrderByCreateTimeDesc(userUid);
        if (orders.isEmpty()) {
            return Result.success(List.of());
        }

        LocalDateTime now = LocalDateTime.now();
        List<VipOrder> validOrders = new ArrayList<>();

        for (VipOrder order : orders) {
            // 已支付订单
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
                validOrders.add(order);
            } 
            // 待支付订单，需检查是否在10分钟内
            else if (order.getPaymentStatus() != null && order.getPaymentStatus() == 0) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isAfter(now)) {
                    validOrders.add(order);
                }
            }
        }

        return Result.success(validOrders);
    }

    @Override
    public Result<Map<String, Object>> createWechatPayParams(Long userUid, String orderNo) {
        if (!StringUtils.hasText(orderNo)) {
            return Result.error("订单号不能为空");
        }

        Optional<VipOrder> orderOptional = vipOrderRepository.findByOrderNoAndUserUid(orderNo, userUid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        VipOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.error(400, "订单已支付");
        }

        try {
            Map<String, Object> payPackage = wechatPayService.createVirtualPaymentParams(
                    order.getOrderNo(),
                    buildVipGoodsId(order),
                    order.getPrice(),
                    userUid);
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", order.getOrderNo());
            result.put("paymentType", PAYMENT_TYPE_VIRTUAL);
            result.put("payParams", payPackage.get("payParams"));
            result.put("security", payPackage.get("security"));
            result.put("packageType", order.getPackageType());
            result.put("period", order.getPeriod());
            return Result.success("获取支付参数成功", result);
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

        Optional<VipOrder> orderOptional = vipOrderRepository.findByOrderNoAndUserUid(orderNo, userUid);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        VipOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.success("支付已处理");
        }

        boolean valid = wechatPayService.verifyVirtualPaymentSecurity(
                orderNo,
                buildVipGoodsId(order),
                order.getPrice(),
                userUid,
                asString(securityData == null ? null : securityData.get("timestamp")),
                asString(securityData == null ? null : securityData.get("nonceStr")),
                asString(securityData == null ? null : securityData.get("signature")));
        if (!valid) {
            return Result.error(400, "虚拟支付校验失败");
        }

        return paySuccessCallback(orderNo);
    }

    @Override
    @Transactional
    public Result<Map<String, Object>> openSchoolVip(Long userUid, Integer months) {
        if (months == null || months <= 0 || months > 12) {
            return Result.error(400, "开通月数必须在 1 到 12 个月之间");
        }

        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("用户不存在");
        }

        if (studentParentBindingRepository.findByParentUid(userUid).isEmpty()) {
            return Result.error(400, "请先绑定学生后再开通校讯通");
        }

        SysAccount account = accountOptional.get();
        extendMembership(account, months, false);
        sysAccountRepository.save(account);

        VipOrder order = new VipOrder();
        order.setOrderNo(buildOrderNo());
        order.setUserUid(userUid);
        order.setUserName(resolveUserName(account));
        order.setUserPhone(resolveUserPhone(account));
        order.setSchoolName(resolveSchoolName(userUid));
        order.setPackageType(SCHOOL_VIP_PACKAGE);
        order.setPeriod(formatMonthPeriod(months));
        order.setPrice(BigDecimal.ZERO);
        order.setPaymentStatus(1);
        order.setPaymentMethod(SCHOOL_PAYMENT_METHOD);
        order.setSourceType(SOURCE_SCHOOL_GIFT);

        VipOrder savedOrder = vipOrderRepository.save(order);

        Map<String, Object> result = new HashMap<>();
        result.put("orderNo", savedOrder.getOrderNo());
        result.put("months", months);
        result.put("sourceType", savedOrder.getSourceType());
        result.put("vipExpireTime", account.getVipExpireTime());
        return Result.success("校讯通开通成功", result);
    }

    @Override
    @Transactional
    public Result<String> paySuccessCallback(String orderNo) {
        Optional<VipOrder> orderOptional = vipOrderRepository.findByOrderNo(orderNo);
        if (orderOptional.isEmpty()) {
            return Result.error("订单不存在");
        }

        VipOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.success("支付已处理");
        }

        order.setPaymentStatus(1);
        if (!StringUtils.hasText(order.getSourceType())) {
            order.setSourceType(SOURCE_ONLINE_PURCHASE);
        }
        order.setPaymentMethod(ONLINE_PAYMENT_METHOD);
        vipOrderRepository.save(order);

        Optional<SysAccount> userOptional = sysAccountRepository.findById(order.getUserUid());
        if (userOptional.isPresent()) {
            SysAccount account = userOptional.get();
            int months = resolveMonths(order.getPeriod());
            boolean grantSvip = containsIgnoreCase(order.getPackageType(), "SVIP");
            boolean shouldGrantVip = containsIgnoreCase(order.getPackageType(), "VIP");

            if (shouldGrantVip || grantSvip) {
                extendMembership(account, months, grantSvip);
                sysAccountRepository.save(account);
            }
        }

        return Result.success("支付处理成功", null);
    }

    @Override
    public Result<Map<String, Object>> getVipOrderList(int current, int size, String keyword, String sourceType,
                                                       Integer paymentStatus, String startDate, String endDate) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("createTime").descending());
        Page<VipOrder> page = vipOrderRepository.findByFilters(
                normalizeKeyword(keyword),
                normalizeKeyword(sourceType),
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                pageable
        );

        LocalDateTime now = LocalDateTime.now();
        page.getContent().forEach(order -> {
            if (!StringUtils.hasText(order.getSourceType())) {
                order.setSourceType(SOURCE_ONLINE_PURCHASE);
            }
            // 动态处理过期状态：待支付(0) 且 超过10分钟
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 0) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isBefore(now)) {
                    order.setPaymentStatus(-1); // -1 表示已过期
                }
            }
        });

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", page.getContent());
        resultData.put("total", page.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);
        return Result.success(resultData);
    }

    @Override
    public List<VipOrder> getVipOrderExportList(String keyword, String sourceType, Integer paymentStatus,
                                                String startDate, String endDate) {
        List<VipOrder> orders = vipOrderRepository.findByFilters(
                normalizeKeyword(keyword),
                sourceType,
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                Sort.by(Sort.Direction.DESC, "createTime")
        );

        LocalDateTime now = LocalDateTime.now();
        orders.forEach(order -> {
            if (!StringUtils.hasText(order.getSourceType())) {
                order.setSourceType(SOURCE_ONLINE_PURCHASE);
            }
            // 动态处理过期状态：待支付(0) 且 超过10分钟
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 0) {
                if (order.getCreateTime() != null && order.getCreateTime().plusMinutes(10).isBefore(now)) {
                    order.setPaymentStatus(-1); // -1 表示已过期
                }
            }
        });
        return orders;
    }

    private void extendMembership(SysAccount account, int months, boolean grantSvip) {
        account.setIsVip(1);
        if (grantSvip) {
            account.setIsSvip(1);
        }

        if (months <= 0) {
            return;
        }

        if (grantSvip) {
            LocalDateTime nextSvipExpire = extendExpireTime(account.getSvipExpireTime(), months);
            account.setSvipExpireTime(nextSvipExpire);

            LocalDateTime vipExpireTime = account.getVipExpireTime();
            if (vipExpireTime == null || vipExpireTime.isBefore(nextSvipExpire)) {
                account.setVipExpireTime(nextSvipExpire);
            }
        } else {
            account.setVipExpireTime(extendExpireTime(account.getVipExpireTime(), months));
        }
    }

    private LocalDateTime extendExpireTime(LocalDateTime currentExpire, int months) {
        LocalDateTime now = LocalDateTime.now();
        if (currentExpire == null || currentExpire.isBefore(now)) {
            return now.plusMonths(months);
        }
        return currentExpire.plusMonths(months);
    }

    private int resolveMonths(String period) {
        if (!StringUtils.hasText(period)) {
            return 0;
        }
        if ("月包".equals(period) || "月卡".equals(period)) {
            return 1;
        }
        if ("季包".equals(period) || "季卡".equals(period)) {
            return 4;
        }
        if ("年包".equals(period) || "年卡".equals(period)) {
            return 12;
        }

        String normalized = period.replace("个月", "").replace("月", "").trim();
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private int resolveDurationMonths(Map<String, Object> orderData) {
        Integer durationMonths = parseInteger(orderData.get("durationMonths"));
        if (durationMonths != null && durationMonths > 0) {
            return durationMonths;
        }

        Integer pricingId = parseInteger(orderData.get("pricingId"));
        if (pricingId != null) {
            Optional<VipPricing> pricingOptional = vipPricingRepository.findById(pricingId);
            if (pricingOptional.isPresent() && pricingOptional.get().getDurationMonths() != null) {
                return pricingOptional.get().getDurationMonths();
            }
        }

        return resolveMonths(asString(orderData.get("period")));
    }

    private String formatMonthPeriod(int months) {
        return months + "个月";
    }

    private String buildVipGoodsId(VipOrder order) {
        String prefix = wechatPayProperties.getVirtualPayment().getVipGoodsPrefix();
        return normalizeGoodsSegment(prefix) + "-"
                + normalizeGoodsSegment(order.getPackageType()) + "-"
                + normalizeGoodsSegment(order.getPeriod());
    }

    private String buildOrderNo() {
        return "VOD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + ThreadLocalRandom.current().nextInt(100, 1000);
    }

    private String resolveUserName(SysAccount account) {
        if (StringUtils.hasText(account.getNickname())) {
            return account.getNickname();
        }
        if (StringUtils.hasText(account.getUsername())) {
            return account.getUsername();
        }
        return "用户" + account.getUid();
    }

    private String resolveUserPhone(SysAccount account) {
        return StringUtils.hasText(account.getPhone()) ? account.getPhone() : "";
    }

    private String resolveSchoolName(Long userUid) {
        List<com.edu.javasb_back.model.entity.StudentParentBinding> bindings =
                studentParentBindingRepository.findByParentUid(userUid);
        if (!bindings.isEmpty()) {
            String studentId = bindings.get(0).getStudentId();
            return sysStudentRepository.findById(studentId)
                    .map(com.edu.javasb_back.model.entity.SysStudent::getSchool)
                    .orElse("");
        }
        return "";
    }

    private BigDecimal parsePrice(Object rawPrice) {
        if (rawPrice == null) {
            return null;
        }
        try {
            return new BigDecimal(rawPrice.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }

    private Integer parseInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean containsIgnoreCase(String source, String keyword) {
        return StringUtils.hasText(source) && source.toUpperCase().contains(keyword.toUpperCase());
    }

    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim() : null;
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

    private String normalizeGoodsSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "default";
        }
        String normalized = value.trim().replaceAll("[^0-9A-Za-z\\u4e00-\\u9fa5]+", "-");
        normalized = normalized.replaceAll("-{2,}", "-");
        normalized = normalized.replaceAll("^-|-$", "");
        return normalized.toLowerCase();
    }
}
