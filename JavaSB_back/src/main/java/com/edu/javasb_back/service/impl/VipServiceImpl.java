package com.edu.javasb_back.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.DeliveryConfig;
import com.edu.javasb_back.model.entity.PaperPrice;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.repository.DeliveryConfigRepository;
import com.edu.javasb_back.repository.PaperPriceRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.service.VipService;

@Service
public class VipServiceImpl implements VipService {

    @Autowired
    private PaperPriceRepository paperPriceRepository;

    @Autowired
    private DeliveryConfigRepository deliveryConfigRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    /**
     * 内部校验 VIP 状态逻辑
     */
    private Result<SysAccount> validateVipStatus(Long uid) {
        Optional<SysAccount> accountOpt = sysAccountRepository.findById(uid);
        if (accountOpt.isEmpty()) return Result.error("用户不存在");
        
        SysAccount account = accountOpt.get();
        // 如果没有 VIP 且没有 SVIP 权限
        if ((account.getIsVip() == null || account.getIsVip() == 0) && 
            (account.getIsSvip() == null || account.getIsSvip() == 0)) {
            return Result.error(403, "您尚未开通会员，请先开通后查看");
        }

        // 校验过期时间
        if (account.getVipExpireTime() != null && 
            account.getVipExpireTime().isBefore(java.time.LocalDateTime.now())) {
            
            // 自动重置权限标识
            account.setIsVip(0);
            account.setIsSvip(0);
            sysAccountRepository.save(account);
            
            return Result.error(403, "您的会员已过期，请续费后继续使用");
        }
        
        return Result.success(account);
    }

    @Override
    public Result<Map<String, Object>> getVipAnalysis(Long uid) {
        // 先进行鉴权和过期判断
        Result<SysAccount> authResult = validateVipStatus(uid);
        if (authResult.getCode() != 200) return Result.error(authResult.getCode(), authResult.getMsg());

        // 模拟数据分析数据，实际应从业务表统计
        Map<String, Object> data = new HashMap<>();
        
        // 成绩构成
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

        // 分数分布
        Map<String, Object> distribution = new HashMap<>();
        distribution.put("rankInfo", "年级前25%");
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
        // 先进行鉴权和过期判断
        Result<SysAccount> authResult = validateVipStatus(uid);
        if (authResult.getCode() != 200) return Result.error(authResult.getCode(), authResult.getMsg());

        // 模拟错题本列表
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> w1 = new HashMap<>();
        w1.put("id", 1);
        w1.put("subject", "数学");
        w1.put("time", "2024-03-20");
        w1.put("question", "已知函数 f(x) = x^2 - 4x + 3，求函数在 [0, 3] 上的最值。");
        w1.put("studentAnswer", "最小值为-1，最大值为3");
        w1.put("correctAnswer", "最小值为-1，最大值为3");
        w1.put("explanation", "函数对称轴为x=2，在区间内。f(2)=-1为极小值也是最小值。端点f(0)=3, f(3)=0，故最大值为3。");
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
            return m;
        }).collect(Collectors.toList());
        config.put("paperConfigs", paperConfigs);

        List<DeliveryConfig> deliveries = deliveryConfigRepository.findAll();
        List<Map<String, Object>> deliveryConfigs = deliveries.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("method", d.getName().equals("标准快递") ? "standard" : d.getName().equals("极速达") ? "express" : "pickup");
            m.put("name", d.getName());
            m.put("baseFee", d.getPrice());
            m.put("freeThreshold", d.getFreeLimit());
            m.put("desc", d.getDescription());
            return m;
        }).collect(Collectors.toList());
        config.put("deliveryConfigs", deliveryConfigs);

        Map<String, Object> globalParams = new HashMap<>();
        globalParams.put("minAmount", 5.00);
        globalParams.put("bindingFee", 2.00);
        config.put("globalParams", globalParams);

        return Result.success(config);
    }

    @Override
    public Result<Void> submitPrintOrder(Long uid, Map<String, Object> orderData) {
        // 模拟提交订单
        return Result.success("订单已提交，请在我的订单中查看进度", null);
    }
}
