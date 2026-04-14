package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/analysis")
    public Result getAnalysis() {
        return Result.success(dashboardService.getAnalysisData());
    }
}
