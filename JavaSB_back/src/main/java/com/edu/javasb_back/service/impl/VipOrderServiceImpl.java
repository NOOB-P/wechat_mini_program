package com.edu.javasb_back.service.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.datasource.DataSourceName;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.VipPricing;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.VipPricingRepository;
import com.edu.javasb_back.repository.VipOrderRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional(readOnly = true)
public class VipOrderServiceImpl implements VipOrderService {

    private static final String SOURCE_ONLINE_PURCHASE = "ONLINE_PURCHASE";
    private static final String SOURCE_SCHOOL_GIFT = "SCHOOL_GIFT";
    private static final String SCHOOL_PAYMENT_METHOD = "\u6821\u8baf\u901a\u8d60\u9001";
    private static final String ONLINE_PAYMENT_METHOD = "\u5fae\u4fe1";
    private static final String SCHOOL_VIP_PACKAGE = "VIP";

    @Autowired
    private VipOrderRepository vipOrderRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private StudentParentBindingRepository studentParentBindingRepository;

    @Autowired
    private com.edu.javasb_back.repository.SysStudentRepository sysStudentRepository;

    @Autowired
    private VipPricingRepository vipPricingRepository;

    @Autowired
    private WechatPayService wechatPayService;

    @Override
    @Transactional
    public Result<VipOrder> createVipOrder(Long userUid, Map<String, Object> orderData) {
        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("\u7528\u6237\u4e0d\u5b58\u5728");
        }

        BigDecimal price = parsePrice(orderData.get("price"));
        if (price == null) {
            return Result.error("\u8ba2\u5355\u91d1\u989d\u4e0d\u80fd\u4e3a\u7a7a");
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
            return Result.error(400, "\u4f1a\u5458\u5957\u9910\u65f6\u957f\u65e0\u6548\uff0c\u8bf7\u68c0\u67e5\u4ef7\u683c\u914d\u7f6e");
        }
        order.setPackageType(StringUtils.hasText(tierCode) ? tierCode : title);
        order.setPeriod(formatMonthPeriod(months));
        order.setPrice(price);
        order.setPaymentStatus(0);
        order.setPaymentMethod(ONLINE_PAYMENT_METHOD);
        order.setSourceType(SOURCE_ONLINE_PURCHASE);

        VipOrder savedOrder = vipOrderRepository.save(order);
        return Result.success(savedOrder);
    }

    @Override
    @DS(DataSourceName.MASTER)
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

        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOptional.get();
        if (!StringUtils.hasText(account.getWxid())) {
            return Result.error(40101, "请先绑定微信后再发起支付");
        }

        try {
            Map<String, Object> payParams = wechatPayService.createJsapiPayParams(
                    order.getOrderNo(),
                    "会员开通-" + order.getPackageType(),
                    order.getPrice(),
                    account.getWxid(),
                    "VIP");
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", order.getOrderNo());
            result.put("payParams", payParams);
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
    public Result<Map<String, Object>> openSchoolVip(Long userUid, Integer months) {
        if (months == null || months <= 0 || months > 12) {
            return Result.error(400, "\u5f00\u901a\u6708\u6570\u5fc5\u987b\u5728 1 \u5230 12 \u4e2a\u6708\u4e4b\u95f4");
        }

        Optional<SysAccount> accountOptional = sysAccountRepository.findById(userUid);
        if (accountOptional.isEmpty()) {
            return Result.error("\u7528\u6237\u4e0d\u5b58\u5728");
        }

        if (studentParentBindingRepository.findByParentUid(userUid).isEmpty()) {
            return Result.error(400, "\u8bf7\u5148\u7ed1\u5b9a\u5b66\u751f\u540e\u518d\u5f00\u901a\u6821\u8baf\u901a");
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
        return Result.success("\u6821\u8baf\u901a\u5f00\u901a\u6210\u529f", result);
    }

    @Override
    @Transactional
    public Result<String> paySuccessCallback(String orderNo) {
        Optional<VipOrder> orderOptional = vipOrderRepository.findByOrderNo(orderNo);
        if (orderOptional.isEmpty()) {
            return Result.error("\u8ba2\u5355\u4e0d\u5b58\u5728");
        }

        VipOrder order = orderOptional.get();
        if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
            return Result.success("\u652f\u4ed8\u5df2\u5904\u7406");
        }

        order.setPaymentStatus(1);
        if (!StringUtils.hasText(order.getSourceType())) {
            order.setSourceType(SOURCE_ONLINE_PURCHASE);
        }
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

        return Result.success("\u652f\u4ed8\u5904\u7406\u6210\u529f");
    }

    @Override
    public Result<Map<String, Object>> getVipOrderList(int current, int size, String keyword, String sourceType, Integer paymentStatus, String startDate, String endDate) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by("createTime").descending());
        Page<VipOrder> page = vipOrderRepository.findByFilters(
                normalizeKeyword(keyword),
                normalizeKeyword(sourceType),
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                pageable
        );

        page.getContent().forEach(order -> {
            if (!StringUtils.hasText(order.getSourceType())) {
                order.setSourceType(SOURCE_ONLINE_PURCHASE);
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
    public List<VipOrder> getVipOrderExportList(String keyword, String sourceType, Integer paymentStatus, String startDate, String endDate) {
        List<VipOrder> orders = vipOrderRepository.findByFilters(
                normalizeKeyword(keyword),
                sourceType,
                paymentStatus,
                parseStartDateTime(startDate),
                parseEndDateTime(endDate),
                Sort.by(Sort.Direction.DESC, "createTime")
        );

        orders.forEach(order -> {
            if (!StringUtils.hasText(order.getSourceType())) {
                order.setSourceType(SOURCE_ONLINE_PURCHASE);
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
        if ("\u6708\u5305".equals(period)) {
            return 1;
        }
        if ("\u6708\u5361".equals(period)) {
            return 1;
        }
        if ("\u5b63\u5305".equals(period)) {
            return 4;
        }
        if ("\u5b63\u5361".equals(period)) {
            return 4;
        }
        if ("\u5e74\u5305".equals(period)) {
            return 12;
        }
        if ("\u5e74\u5361".equals(period)) {
            return 12;
        }

        String normalized = period.replace("\u4e2a\u6708", "").replace("\u6708", "").trim();
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
        return months + "\u4e2a\u6708";
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
        return "\u7528\u6237" + account.getUid();
    }

    private String resolveUserPhone(SysAccount account) {
        return StringUtils.hasText(account.getPhone()) ? account.getPhone() : "";
    }

    private String resolveSchoolName(Long userUid) {
        List<com.edu.javasb_back.model.entity.StudentParentBinding> bindings = studentParentBindingRepository.findByParentUid(userUid);
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
}
