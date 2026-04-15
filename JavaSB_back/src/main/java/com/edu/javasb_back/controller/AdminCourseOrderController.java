package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.CourseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/order/course")
public class AdminCourseOrderController {

    @Autowired
    private CourseOrderService courseOrderService;

    @LogOperation("后台查询课程订单列表")
    @PreAuthorize("hasAuthority('order:course:list')")
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
