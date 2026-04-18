package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.repository.*;
import com.edu.javasb_back.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    @Autowired
    private SysAccountRepository accountRepository;

    @Autowired
    private SysSchoolRepository schoolRepository;

    @Autowired
    private SysStudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ExamPaperRepository paperRepository;

    @Autowired
    private SysClassRepository classRepository;

    @Autowired
    private VipOrderRepository vipOrderRepository;

    @Autowired
    private CourseOrderRepository courseOrderRepository;

    @Autowired
    private PrintOrderRepository printOrderRepository;

    @Override
    public Map<String, Object> getAnalysisData() {
        Map<String, Object> data = new HashMap<>();

        // 1. 基础统计 (Stats)
        List<Map<String, Object>> stats = new ArrayList<>();
        
        long userCount = accountRepository.count();
        long schoolCount = schoolRepository.count();
        long courseCount = courseRepository.count();
        long paperCount = paperRepository.count();

        stats.add(createStatItem("平台总注册用户", userCount, "0%", "up", "User", "blue"));
        stats.add(createStatItem("总入驻学校", schoolCount, "0%", "up", "School", "cyan"));
        stats.add(createStatItem("平台总课程数", courseCount, "0%", "up", "Course", "indigo"));
        stats.add(createStatItem("试卷库总量", paperCount, "0%", "up", "Paper", "blue"));

        data.put("stats", stats);

        // 2. 订单统计 (取代原系统监控)
        Map<String, Object> systemMonitor = new HashMap<>();
        
        long vipOrders = vipOrderRepository.count();
        long courseOrders = courseOrderRepository.count();
        long printOrders = printOrderRepository.count();
        long totalOrders = vipOrders + courseOrders + printOrders;

        Map<String, Object> orderStats = new HashMap<>();
        orderStats.put("vip", vipOrders);
        orderStats.put("course", courseOrders);
        orderStats.put("print", printOrders);
        orderStats.put("total", totalOrders);
        systemMonitor.put("orderStats", orderStats);

        // 保留原有的任务队列结构，但展示订单分布
        Map<String, Object> taskQueue = new HashMap<>();
        taskQueue.put("processing", vipOrders);
        taskQueue.put("waiting", courseOrders);
        taskQueue.put("completed", printOrders);
        taskQueue.put("total", totalOrders);
        systemMonitor.put("taskQueue", taskQueue);

        data.put("systemMonitor", systemMonitor);

        // 3. 用户增长趋势 (真实数据)
        Map<String, Object> userGrowthTrend = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Integer> values = new ArrayList<>();
        
        List<Object[]> regStats = accountRepository.findRegistrationStats();
        for (Object[] row : regStats) {
            dates.add((String) row[0]);
            values.add(((Number) row[1]).intValue());
        }
        
        if (dates.isEmpty()) {
            dates.add(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd")));
            values.add(0);
        }

        userGrowthTrend.put("dates", dates);
        userGrowthTrend.put("values", values);
        data.put("userGrowthTrend", userGrowthTrend);

        // 4. 用户分布 (结合会员订单数据)
        List<Map<String, Object>> userDistribution = new ArrayList<>();
        long vipCount = vipOrderRepository.count();
        long totalUsers = accountRepository.count();
        
        int vipPercent = (totalUsers == 0) ? 0 : (int) Math.round((double) vipCount * 100 / totalUsers);
        int commonPercent = Math.max(0, 100 - vipPercent);

        userDistribution.add(createDistItem("VIP/SVIP用户", vipPercent, "#5D87FF"));
        userDistribution.add(createDistItem("普通用户", commonPercent, "#A8AAAD"));
        
        data.put("userDistribution", userDistribution);

        // 5. 今日动态 (真实数据)
        List<Map<String, Object>> activities = new ArrayList<>();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // 5.1 新用户注册
        accountRepository.findTop5ByOrderByCreateTimeDesc().forEach(acc -> {
            if (acc.getCreateTime() != null) {
                activities.add(createActivityItem("新用户注册", acc.getCreateTime().format(timeFormatter), 
                    "用户 [" + acc.getNickname() + "] 注册了账号", "blue", acc.getCreateTime()));
            }
        });

        // 5.2 订单动态
        vipOrderRepository.findTop5ByOrderByCreateTimeDesc().forEach(order -> {
            if (order.getCreateTime() != null) {
                activities.add(createActivityItem("VIP订单", order.getCreateTime().format(timeFormatter), 
                    "用户 [" + order.getUserName() + "] 购买了 " + order.getPackageType(), "indigo", order.getCreateTime()));
            }
        });

        // 5.3 课程动态
        courseRepository.findTop5ByOrderByCreateTimeDesc().forEach(course -> {
            if (course.getCreateTime() != null) {
                activities.add(createActivityItem("课程上传", course.getCreateTime().format(timeFormatter), 
                    "上传了新课程 《" + course.getTitle() + "》", "green", course.getCreateTime()));
            }
        });

        // 5.4 试卷动态
        paperRepository.findTop5ByOrderByCreateTimeDesc().forEach(paper -> {
            if (paper.getCreateTime() != null) {
                activities.add(createActivityItem("试卷录入", paper.getCreateTime().format(timeFormatter), 
                    "录入了 " + paper.getTitle(), "orange", paper.getCreateTime()));
            }
        });

        // 按时间倒序排列并取前 6 条
        List<Map<String, Object>> sortedActivities = activities.stream()
            .sorted((a, b) -> ((LocalDateTime) b.get("rawTime")).compareTo((LocalDateTime) a.get("rawTime")))
            .limit(6)
            .map(item -> {
                item.remove("rawTime"); // 移除内部排序用的时间
                return item;
            })
            .collect(Collectors.toList());

        data.put("todayActivities", sortedActivities);

        // 6. 系统公告 (Notice)
        List<String> notices = new ArrayList<>();
        notices.add("欢迎使用优题慧教育后台管理系统！");
        notices.add("新功能：订单管理现已支持学校字段查询与导出。");
        notices.add("维护公告：本周六凌晨 2 点进行系统例行维护。");
        data.put("notices", notices);

        return data;
    }

    private Map<String, Object> createActivityItem(String title, String time, String content, String color, LocalDateTime rawTime) {
        Map<String, Object> item = new HashMap<>();
        item.put("title", title);
        item.put("time", time);
        item.put("content", content);
        item.put("color", color);
        item.put("rawTime", rawTime);
        return item;
    }

    private Map<String, Object> createStatItem(String title, long value, String percentage, String trend, String icon, String color) {
        Map<String, Object> item = new HashMap<>();
        item.put("title", title);
        item.put("value", value);
        item.put("percentage", percentage);
        item.put("trend", trend);
        item.put("icon", icon);
        item.put("color", color);
        item.put("unit", ""); // 默认为空
        return item;
    }

    private Map<String, Object> createDistItem(String name, int value, String color) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("value", value);
        item.put("color", color);
        return item;
    }
}
