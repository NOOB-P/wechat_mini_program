package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.CourseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 后台管理端课程订单管理
 */
@RestController
@RequestMapping("/api/admin/order/course")
public class AdminCourseOrderController {

    @Autowired
    private CourseOrderService courseOrderService;

    /**
     * 分页查询课程订单
     */
    @LogOperation("后台查询课程订单列表")
    @GetMapping("/list")
    public Result<Map<String, Object>> getCourseOrderList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer paymentStatus) {
        return courseOrderService.getCourseOrderList(current, size, orderNo, userName, paymentStatus);
    }
}