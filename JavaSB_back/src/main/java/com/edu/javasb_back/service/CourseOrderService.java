package com.edu.javasb_back.service;

import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;

import java.util.List;
import java.util.Map;

public interface CourseOrderService {
    /**
     * 创建课程订单
     */
    CourseOrder createOrder(Long userUid, String courseId);

    /**
     * 模拟支付成功
     */
    void paySuccess(String orderNo);

    /**
     * 检查用户是否已购买某课程
     */
    boolean isCoursePurchased(Long userUid, String courseId);

    /**
     * 获取用户已购买的课程列表
     */
    List<Course> getPurchasedCourses(Long userUid);

    /**
     * 后台：分页查询课程订单
     */
    com.edu.javasb_back.common.Result<java.util.Map<String, Object>> getCourseOrderList(int current, int size, String orderNo, String userName, Integer paymentStatus, String startDate, String endDate);

    /**
     * 后台：导出课程订单
     */
    List<Map<String, Object>> getCourseOrderExportList(String orderNo, String userName, Integer paymentStatus, String startDate, String endDate);
}
