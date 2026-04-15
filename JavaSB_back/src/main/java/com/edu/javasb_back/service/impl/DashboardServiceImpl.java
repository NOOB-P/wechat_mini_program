package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.repository.*;
import com.edu.javasb_back.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Override
    public Map<String, Object> getAnalysisData() {
        Map<String, Object> data = new HashMap<>();

        // 1. 基础统计 (Stats)
        List<Map<String, Object>> stats = new ArrayList<>();
        
        long userCount = accountRepository.count();
        long schoolCount = schoolRepository.count();
        long courseCount = courseRepository.count();
        long paperCount = paperRepository.count();

        // 记录数据来源日志
        log.info("Dashboard stats source: user={}, school={}, course={}, paper={}", 
                userCount, schoolCount, courseCount, paperCount);

        stats.add(createStatItem("平台总注册用户", userCount, "0%", "up", "User", "blue"));
        stats.add(createStatItem("总入驻学校", schoolCount, "0%", "up", "School", "cyan"));
        stats.add(createStatItem("平台总课程数", courseCount, "0%", "up", "Course", "indigo"));
        stats.add(createStatItem("试卷库总量", paperCount, "0%", "up", "Paper", "blue"));

        data.put("stats", stats);

        // 2. 系统监控 (System Monitor)
        Map<String, Object> systemMonitor = new HashMap<>();
        
        Map<String, Object> taskQueue = new HashMap<>();
        taskQueue.put("processing", 12);
        taskQueue.put("waiting", 3);
        taskQueue.put("completed", 141);
        taskQueue.put("total", 156);
        systemMonitor.put("taskQueue", taskQueue);

        Map<String, Object> storage = new HashMap<>();
        storage.put("percentage", 44.5);
        storage.put("used", 456);
        storage.put("total", 1024);
        systemMonitor.put("storage", storage);
        
        data.put("systemMonitor", systemMonitor);

        // 3. 用户增长趋势 (结合学生入驻数据)
        Map<String, Object> userGrowthTrend = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Integer> values = new ArrayList<>();
        
        long studentCount = studentRepository.count();
        // 模拟增长曲线（以真实数据为基准分布在30天内）
        for (int i = 1; i <= 30; i++) {
            dates.add("4/" + i);
            // 简单线性分布 + 随机抖动
            int baseValue = (int) (studentCount * i / 30);
            values.add(baseValue + (int) (Math.random() * 5));
        }
        userGrowthTrend.put("dates", dates);
        userGrowthTrend.put("values", values);
        data.put("userGrowthTrend", userGrowthTrend);

        // 4. 用户分布 (结合会员订单数据)
        List<Map<String, Object>> userDistribution = new ArrayList<>();
        long vipCount = vipOrderRepository.count();
        long totalUsers = accountRepository.count();
        
        // 计算百分比
        int vipPercent = (totalUsers == 0) ? 0 : (int) Math.round((double) vipCount * 100 / totalUsers);
        int commonPercent = Math.max(0, 100 - vipPercent);

        userDistribution.add(createDistItem("VIP/SVIP用户", vipPercent, "#5D87FF"));
        userDistribution.add(createDistItem("普通用户", commonPercent, "#A8AAAD"));
        
        data.put("userDistribution", userDistribution);

        // 5. 今日动态 (Today's Activities)
        List<Map<String, Object>> todayActivities = new ArrayList<>();
        todayActivities.add(createActivityItem("新用户注册", "10:24", "用户 [admin] 注册了账号", "blue"));
        todayActivities.add(createActivityItem("课程上传", "09:15", "上传了新课程 《初中数学基础巩固》", "green"));
        todayActivities.add(createActivityItem("试卷录入", "11:30", "录入了 2024 年北京人大附中真题", "orange"));
        todayActivities.add(createActivityItem("系统升级", "08:00", "系统完成 V2.1 版本升级", "indigo"));
        data.put("todayActivities", todayActivities);

        // 6. 系统公告 (Notice)
        List<String> notices = new ArrayList<>();
        notices.add("欢迎使用优赖教育后台管理系统！");
        notices.add("新功能：试卷管理现已支持多级分类与智能排序。");
        notices.add("维护公告：本周六凌晨 2 点进行系统例行维护。");
        data.put("notices", notices);

        return data;
    }

    private Map<String, Object> createActivityItem(String title, String time, String content, String color) {
        Map<String, Object> item = new HashMap<>();
        item.put("title", title);
        item.put("time", time);
        item.put("content", content);
        item.put("color", color);
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
