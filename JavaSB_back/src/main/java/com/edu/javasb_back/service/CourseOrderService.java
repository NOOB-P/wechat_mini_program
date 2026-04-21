package com.edu.javasb_back.service;

import java.util.List;
import java.util.Map;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;

public interface CourseOrderService {

    CourseOrder createOrder(Long userUid, String courseId);

    void paySuccess(String orderNo);

    Result<Map<String, Object>> createWechatPayParams(Long userUid, String orderNo);

    Result<String> confirmVirtualPayment(Long userUid, String orderNo, Map<String, Object> securityData);

    boolean isCoursePurchased(Long userUid, String courseId);

    List<Course> getPurchasedCourses(Long userUid);

    Result<Map<String, Object>> getCourseOrderList(int current, int size, String orderNo, String userName,
                                                   Integer paymentStatus, String startDate, String endDate);

    List<Map<String, Object>> getCourseOrderExportList(String orderNo, String userName, Integer paymentStatus,
                                                       String startDate, String endDate);
}
