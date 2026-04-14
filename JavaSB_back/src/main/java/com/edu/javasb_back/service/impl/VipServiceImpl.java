package com.edu.javasb_back.service.impl;

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
import com.edu.javasb_back.service.VipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    private Result<SysAccount> validateVipStatus(Long uid) {
        Optional<SysAccount> accountOpt = sysAccountRepository.findById(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("用户不存在");
        }

        SysAccount account = accountOpt.get();
        if ((account.getIsVip() == null || account.getIsVip() == 0)
                && (account.getIsSvip() == null || account.getIsSvip() == 0)) {
            return Result.error(403, "您尚未开通会员，请先开通后查看");
        }

        if (account.getVipExpireTime() != null && account.getVipExpireTime().isBefore(LocalDateTime.now())) {
            account.setIsVip(0);
            account.setIsSvip(0);
            sysAccountRepository.save(account);
            return Result.error(403, "您的会员已过期，请续费后继续使用");
        }

        return Result.success(account);
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
        List<Map<String, Object>> paperConfigs = prices.stream().map(price -> {
            Map<String, Object> item = new HashMap<>();
            item.put("size", price.getType());
            item.put("side", price.getSide());
            item.put("color", price.getColor());
            item.put("price", price.getPrice());
            return item;
        }).collect(Collectors.toList());
        config.put("paperConfigs", paperConfigs);

        List<DeliveryConfig> deliveries = deliveryConfigRepository.findAll();
        List<Map<String, Object>> deliveryConfigs = deliveries.stream().map(delivery -> {
            Map<String, Object> item = new HashMap<>();
            item.put("method",
                    "标准快递".equals(delivery.getName()) ? "standard"
                            : "极速达".equals(delivery.getName()) ? "express" : "pickup");
            item.put("name", delivery.getName());
            item.put("baseFee", delivery.getPrice());
            item.put("freeThreshold", delivery.getFreeLimit());
            item.put("desc", delivery.getDescription());
            return item;
        }).collect(Collectors.toList());
        config.put("deliveryConfigs", deliveryConfigs);

        Map<String, Object> globalParams = new HashMap<>();
        globalParams.put("minAmount", 5.00);
        globalParams.put("bindingFee", 2.00);
        config.put("globalParams", globalParams);

        return Result.success(config);
    }

    @Override
    @Transactional
    public Result<Void> submitPrintOrder(Long uid, Map<String, Object> orderData) {
        String paperSize = (String) orderData.get("paperSize");
        String printSide = (String) orderData.get("printSide");
        String color = (String) orderData.get("color");
        Integer pages = (Integer) orderData.get("pages");
        if (pages == null) {
            pages = 20;
        }

        String deliveryMethod = (String) orderData.get("deliveryMethod");
        String userName = (String) orderData.get("userName");
        String userPhone = (String) orderData.get("userPhone");
        String documentName = (String) orderData.get("documentName");
        if (documentName == null) {
            documentName = "wrongbook_print_" + System.currentTimeMillis();
        }

        String finalPaperSize = paperSize;
        String finalPrintSide = printSide;
        String finalColor = color;
        BigDecimal paperUnitPrice = paperPriceRepository.findAll().stream()
                .filter(price -> price.getType().equalsIgnoreCase(finalPaperSize)
                        && price.getSide().equals(finalPrintSide)
                        && price.getColor().equals(finalColor))
                .map(PaperPrice::getPrice)
                .findFirst()
                .orElse(new BigDecimal("0.50"));

        BigDecimal paperCost = paperUnitPrice.multiply(new BigDecimal(pages));
        BigDecimal bindingFee = new BigDecimal("2.00");
        BigDecimal minAmount = new BigDecimal("5.00");

        BigDecimal totalBase = paperCost.add(bindingFee);
        if (totalBase.compareTo(minAmount) < 0) {
            totalBase = minAmount;
        }

        String methodName = "standard".equals(deliveryMethod) ? "标准快递"
                : "express".equals(deliveryMethod) ? "极速达" : "自提";

        DeliveryConfig delivery = deliveryConfigRepository.findAll().stream()
                .filter(item -> item.getName().equals(methodName))
                .findFirst()
                .orElse(null);

        BigDecimal shippingFee = BigDecimal.ZERO;
        if (delivery != null) {
            if (delivery.getFreeLimit().compareTo(BigDecimal.ZERO) == 0
                    || totalBase.compareTo(delivery.getFreeLimit()) < 0) {
                shippingFee = delivery.getPrice();
            }
        }

        BigDecimal finalPrice = totalBase.add(shippingFee);

        PrintOrder order = new PrintOrder();
        order.setOrderNo("POD" + System.currentTimeMillis() + (int) (Math.random() * 900 + 100));
        order.setUserName(userName != null ? userName : "微信用户");
        order.setUserPhone(userPhone != null ? userPhone : "");
        order.setDocumentName(documentName);
        order.setPages(pages);
        order.setPrintType(paperSize + "/" + printSide + "/" + color);
        order.setDeliveryMethod(methodName);
        order.setTotalPrice(finalPrice);
        order.setOrderStatus(1);
        printOrderRepository.save(order);

        return Result.success("订单已提交，请前往支付", null);
    }
}
