package com.edu.javasb_back.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.model.entity.VipConfig;
import com.edu.javasb_back.repository.DeliveryConfigRepository;
import com.edu.javasb_back.repository.PaperPriceRepository;
import com.edu.javasb_back.repository.PrintOrderRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.repository.VipConfigRepository;
import com.edu.javasb_back.service.SysNotificationService;
import com.edu.javasb_back.service.VipService;
import com.edu.javasb_back.utils.VipTypeUtils;
import java.time.LocalDateTime;

@Service
public class VipServiceImpl implements VipService {


    @Autowired
    private PaperPriceRepository paperPriceRepository;

    @Autowired
    private DeliveryConfigRepository deliveryConfigRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private PrintOrderRepository printOrderRepository;

    @Autowired
    private StudentParentBindingRepository studentParentBindingRepository;

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Autowired
    private VipConfigRepository vipConfigRepository;

    @Autowired
    private SysNotificationService notificationService;

    /**
     * 内部校验 VIP 状态逻辑
     */
    private Result<SysAccount> validateVipStatus(Long uid) {
        Optional<SysAccount> accountOpt = sysAccountRepository.findById(uid);
        if (accountOpt.isEmpty()) return Result.error("用户不存在");
        
        SysAccount account = accountOpt.get();
        boolean changed = normalizeVipStatus(account);
        if (changed) {
            sysAccountRepository.save(account);
        }

        boolean vipActive = VipTypeUtils.isVip(account.getVipType());
        boolean svipActive = VipTypeUtils.isSvip(account.getVipType());

        if (!vipActive && !svipActive) {
            return Result.error(403, "您尚未开通会员，请先开通后查看");
        }
        
        return Result.success(account);
    }

    private boolean normalizeVipStatus(SysAccount account) {
        if (account == null) {
            return false;
        }

        Integer targetType = VipTypeUtils.resolveTargetVipType(account.getVipType(), account.getVipExpireTime());
        if (!targetType.equals(account.getVipType() == null ? VipTypeUtils.NONE : account.getVipType())) {
            account.setVipType(targetType);
            if (targetType == VipTypeUtils.NONE) {
                account.setVipConfigId(null);
            }
            return true;
        }
        return false;
    }

    @Override
    public Result<Map<String, Object>> getRechargeDisplayConfig(Long uid) {
        Map<String, Object> data = new HashMap<>();
        List<VipConfig> enabledConfigs = vipConfigRepository.findByIsEnabledOrderBySortOrderAsc(1);

        String schoolId = null;
        String schoolName = null;
        List<StudentParentBinding> bindings = studentParentBindingRepository.findByParentUid(uid);
        if (!bindings.isEmpty()) {
            Optional<SysStudent> studentOpt = sysStudentRepository.findById(bindings.get(0).getStudentId());
            if (studentOpt.isPresent()) {
                SysStudent student = studentOpt.get();
                schoolId = student.getSchoolId();
                schoolName = student.getSchool();
            }
        }

        final String currentSchoolId = schoolId;
        List<VipConfig> matchedConfigs = enabledConfigs.stream()
                .filter(config -> isSchoolEnabled(config, currentSchoolId))
                .collect(Collectors.toList());

        data.put("userSchoolId", schoolId);
        data.put("userSchoolName", schoolName);
        data.put("hasBoundStudent", schoolId != null && !schoolId.isBlank());
        data.put("showRechargePage", !matchedConfigs.isEmpty());
        data.put("pageMode", matchedConfigs.isEmpty() ? "school-message" : "recharge");
        data.put("vipConfigs", matchedConfigs);
        return Result.success("获取成功", data);
    }

    private boolean isSchoolEnabled(VipConfig config, String schoolId) {
        if (schoolId == null || schoolId.isBlank() || config.getSchools() == null || config.getSchools().isEmpty()) {
            return false;
        }
        return config.getSchools().stream()
                .anyMatch(item -> schoolId.equals(item.getSchoolId()));
    }

    @Override
    public Result<Map<String, Object>> getVipAnalysis(Long uid) {
        Result<SysAccount> authResult = validateVipStatus(uid);
        if (authResult.getCode() != 200) {
            return Result.error(authResult.getCode(), authResult.getMsg());
        }

        Map<String, Object> data = new HashMap<>();

        List<Map<String, Object>> composition = new ArrayList<>();
        Map<String, Object> comp1 = new HashMap<>();
        comp1.put("name", "基础题");
        comp1.put("value", 65);
        comp1.put("level", "A");
        composition.add(comp1);

        Map<String, Object> comp2 = new HashMap<>();
        comp2.put("name", "综合题");
        comp2.put("value", 20);
        comp2.put("level", "B");
        composition.add(comp2);

        Map<String, Object> comp3 = new HashMap<>();
        comp3.put("name", "难题");
        comp3.put("value", 15);
        comp3.put("level", "C");
        composition.add(comp3);
        data.put("composition", composition);

        Map<String, Object> distribution = new HashMap<>();
        distribution.put("rankInfo", "年级前5%");
        distribution.put("overallLevel", "A");
        List<Map<String, Object>> levels = new ArrayList<>();
        Map<String, Object> l1 = new HashMap<>();
        l1.put("level", "A");
        l1.put("count", 8);
        levels.add(l1);

        Map<String, Object> l2 = new HashMap<>();
        l2.put("level", "B");
        l2.put("count", 15);
        levels.add(l2);

        Map<String, Object> l3 = new HashMap<>();
        l3.put("level", "C");
        l3.put("count", 20);
        levels.add(l3);

        Map<String, Object> l4 = new HashMap<>();
        l4.put("level", "D");
        l4.put("count", 5);
        levels.add(l4);

        Map<String, Object> l5 = new HashMap<>();
        l5.put("level", "E");
        l5.put("count", 2);
        levels.add(l5);
        distribution.put("levels", levels);
        data.put("distribution", distribution);

        // 趋势
        List<Map<String, Object>> trend = new ArrayList<>();
        Map<String, Object> t1 = new HashMap<>();
        t1.put("date", "第一周");
        t1.put("score", 82);
        trend.add(t1);

        Map<String, Object> t2 = new HashMap<>();
        t2.put("date", "第二周");
        t2.put("score", 85);
        trend.add(t2);

        Map<String, Object> t3 = new HashMap<>();
        t3.put("date", "第三周");
        t3.put("score", 88);
        trend.add(t3);

        Map<String, Object> t4 = new HashMap<>();
        t4.put("date", "第四周");
        t4.put("score", 86);
        trend.add(t4);

        Map<String, Object> t5 = new HashMap<>();
        t5.put("date", "第五周");
        t5.put("score", 92);
        trend.add(t5);
        data.put("trend", trend);

        return Result.success(data);
    }

    @Override
    public Result<List<Map<String, Object>>> getWrongBookList(Long uid, Map<String, Object> params) {
        Result<SysAccount> authResult = validateVipStatus(uid);
        if (authResult.getCode() != 200) {
            return Result.error(authResult.getCode(), authResult.getMsg());
        }
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> w1 = new HashMap<>();
        w1.put("id", 1);
        w1.put("subject", "数学");
        w1.put("time", "2024-03-20");
        w1.put("question", "已知函数 f(x) = x^2 - 4x + 3，求函数在 [0, 3] 上的最值。");
        w1.put("studentAnswer", "最小值为-1，最大值为3");
        w1.put("correctAnswer", "最小值为-1，最大值为3");
        w1.put("explanation", "函数对称轴为 x=2，在区间内 f(2)=-1 为最小值；端点 f(0)=3, f(3)=0，因此最大值为 3。");
        w1.put("tags", Arrays.asList("二次函数", "最值问题"));
        list.add(w1);

        Map<String, Object> w2 = new HashMap<>();
        w2.put("id", 2);
        w2.put("subject", "物理");
        w2.put("time", "2024-03-21");
        w2.put("question", "一个物体从高处落下，不计空气阻力，其机械能是否守恒？");
        w2.put("studentAnswer", "不守恒");
        w2.put("correctAnswer", "守恒");
        w2.put("explanation", "只受重力做功，机械能守恒。");
        w2.put("tags", Arrays.asList("机械能", "守恒定律"));
        list.add(w2);
        return Result.success(list);
    }

    @Override
    public Result<Map<String, Object>> getPrintConfig() {
        Map<String, Object> config = new HashMap<>();
        List<PaperPrice> prices = paperPriceRepository.findAll();
        List<Map<String, Object>> paperConfigs = prices.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("size", p.getType());
            m.put("side", p.getSide());
            m.put("color", p.getColor());
            m.put("price", p.getPrice());
            m.put("minQuantity", p.getMinQuantity());
            return m;
        }).collect(Collectors.toList());
        config.put("paperConfigs", paperConfigs);

        List<DeliveryConfig> deliveries = deliveryConfigRepository.findAll();
        List<Map<String, Object>> deliveryConfigs = deliveries.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("method", resolveDeliveryCode(d));
            m.put("name", d.getName());
            m.put("baseFee", d.getPrice());
            m.put("freeThreshold", d.getFreeLimit());
            m.put("desc", d.getDescription());
            return m;
        }).collect(Collectors.toList());
        config.put("deliveryConfigs", deliveryConfigs);

        Map<String, Object> globalParams = new HashMap<>();
        globalParams.put("minAmount", 0.00);
        globalParams.put("bindingFee", 0.00);
        config.put("globalParams", globalParams);

        return Result.success("获取成功", config);
    }

    @Override
    @Transactional
    public Result<PrintOrder> submitPrintOrder(Long uid, Map<String, Object> orderData) {
        // 1. 参数提取
        String paperSize = (String) orderData.get("paperSize");
        String printSide = (String) orderData.get("printSide");
        String color = (String) orderData.get("color");
        Integer pages = parseInteger(orderData.get("pages"));
        if (pages == null) pages = 20; // 默认页数，实际应从小程序传参
        
        String deliveryMethod = (String) orderData.get("deliveryMethod");
        String userName = (String) orderData.get("userName");
        String userPhone = (String) orderData.get("userPhone");
        String deliveryAddress = (String) orderData.get("address");
        String documentName = (String) orderData.get("documentName");
        if (documentName == null) documentName = "错题打印文档_" + System.currentTimeMillis();

        // 2. 核心价格计算 (后端校验)
        // 查询纸张单价
        String finalPaperSize = paperSize;
        String finalPrintSide = printSide;
        String finalColor = color;
        PaperPrice matchedPaperPrice = paperPriceRepository.findAll().stream()
                .filter(p -> p.getType().equalsIgnoreCase(finalPaperSize) && 
                            p.getSide().equals(finalPrintSide) && 
                            p.getColor().equals(finalColor))
                .findFirst()
                .orElse(null);

        BigDecimal paperUnitPrice = matchedPaperPrice == null ? new BigDecimal("0.50") : matchedPaperPrice.getPrice();
        int minQuantity = matchedPaperPrice == null || matchedPaperPrice.getMinQuantity() == null
                ? 1
                : Math.max(matchedPaperPrice.getMinQuantity(), 1);
        pages = Math.max(pages, minQuantity);

        BigDecimal paperCost = paperUnitPrice.multiply(new BigDecimal(pages));
        BigDecimal bindingFee = BigDecimal.ZERO; // 装订费已去除
        
        BigDecimal totalBase = paperCost.add(bindingFee);
        
        // 计算运费
        DeliveryConfig delivery = deliveryConfigRepository.findAll().stream()
                .filter(d -> resolveDeliveryCode(d).equals(deliveryMethod))
                .findFirst().orElse(null);
        String methodName = delivery != null ? delivery.getName() : resolveDeliveryName(deliveryMethod);
                
        BigDecimal shippingFee = BigDecimal.ZERO;
        if (delivery != null) {
            // 如果不满足免邮额度
            if (delivery.getFreeLimit().compareTo(BigDecimal.ZERO) == 0 || 
                totalBase.compareTo(delivery.getFreeLimit()) < 0) {
                shippingFee = delivery.getPrice();
            }
        }
        
        BigDecimal finalPrice = totalBase.add(shippingFee);

        // 3. 创建订单实体
        PrintOrder order = new PrintOrder();
        order.setOrderNo("POD" + System.currentTimeMillis() + (int)(Math.random() * 900 + 100));
        order.setUserUid(uid);
        order.setUserName(userName != null ? userName : "微信用户");
        order.setUserPhone(userPhone != null ? userPhone : "");
        order.setDocumentName(documentName);
        order.setPages(pages);
        order.setPrintType(paperSize + "/" + printSide + "/" + color);
        order.setDeliveryMethod(methodName);
        order.setDeliveryAddress(deliveryAddress);
        order.setTotalPrice(finalPrice);
        order.setOrderStatus(1); // 1-待支付

        // 4. 保存入库
        printOrderRepository.save(order);

        // 发送通知给家长
        com.edu.javasb_back.model.entity.SysNotification notification = new com.edu.javasb_back.model.entity.SysNotification();
        notification.setTitle("打印订单待支付提醒");
        notification.setContent("您的孩子发起了试卷打印申请（" + order.getDocumentName() + "），共 " + order.getPages() + " 页，请在10分钟内完成支付。");
        notification.setCategory("print");
        notification.setLevel("warning");
        notification.setPublisher("系统通知");
        notification.setTargetType(1);
        notification.setTargetUid(uid);
        notification.setIsPublished(1);
        notification.setCreateTime(LocalDateTime.now());
        notification.setActionText("立即支付");
        notification.setActionPath("/subpkg_mine/pages/mine/order-list?tab=print");
        notificationService.saveNotification(notification);

        return Result.success("订单已提交，请前往支付", order);
    }

    private Integer parseInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Integer integerValue) {
            return integerValue;
        }
        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception exception) {
            return null;
        }
    }

    private String resolveDeliveryCode(DeliveryConfig deliveryConfig) {
        if (deliveryConfig == null) {
            return "";
        }
        if (StringUtils.hasText(deliveryConfig.getCode())) {
            return deliveryConfig.getCode().trim();
        }
        return switch (deliveryConfig.getName()) {
            case "标准快递" -> "standard";
            case "极速达" -> "express";
            case "自提" -> "pickup";
            default -> deliveryConfig.getId() == null ? "" : "delivery_" + deliveryConfig.getId();
        };
    }

    private String resolveDeliveryName(String deliveryCode) {
        return switch (deliveryCode == null ? "" : deliveryCode) {
            case "standard" -> "标准快递";
            case "express" -> "极速达";
            case "pickup" -> "自提";
            default -> deliveryCode;
        };
    }
}
