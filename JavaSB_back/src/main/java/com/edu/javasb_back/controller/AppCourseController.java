package com.edu.javasb_back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;
import com.edu.javasb_back.service.CourseOrderService;
import com.edu.javasb_back.service.CourseService;

@RestController
@RequestMapping("/api/app")
public class AppCourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseOrderService orderService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (Exception e) {
            return null;
        }
    }

    @LogOperation("获取精选课程列表")
    @GetMapping("/course/list")
    public Result<List<Course>> getCourseList(@RequestParam(required = false) Integer isRecommend) {
        Result<List<Course>> result = courseService.getGeneralCourseList(isRecommend);
        Long uid = getCurrentUid();
        if (uid != null && result.getData() != null) {
            result.getData().forEach(course -> course.setIsPurchased(orderService.isCoursePurchased(uid, course.getId())));
        }
        return result;
    }

    @LogOperation("获取课程详情")
    @GetMapping("/course/detail")
    public Result<Course> getCourseDetail(@RequestParam("id") String id) {
        return courseService.getCourseDetail(getCurrentUid(), id);
    }

    @LogOperation("获取同步课程列表")
    @GetMapping("/resource/sync-course/list")
    public Result<List<Course>> getSyncCourseList(@RequestParam(value = "subject", required = false) String subject,
                                                  @RequestParam(value = "grade", required = false) String grade) {
        Result<List<Course>> result = courseService.getSyncCourseList(subject, grade);
        Long uid = getCurrentUid();
        if (uid != null && result.getData() != null) {
            result.getData().forEach(course -> course.setIsPurchased(orderService.isCoursePurchased(uid, course.getId())));
        }
        return result;
    }

    @LogOperation("获取家庭教育列表")
    @GetMapping("/resource/family-edu/list")
    public Result<List<Course>> getFamilyEduList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String filter) {
        Long uid = getCurrentUid();
        Result<List<Course>> result = courseService.getFamilyEduList(uid, keyword, filter);
        if (uid != null && result.getData() != null) {
            result.getData().forEach(course -> course.setIsPurchased(orderService.isCoursePurchased(uid, course.getId())));
        }
        return result;
    }

    @LogOperation("获取学霸说列表")
    @GetMapping("/resource/student-talk/list")
    public Result<List<Course>> getStudentTalkList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String filter) {
        Long uid = getCurrentUid();
        Result<List<Course>> result = courseService.getStudentTalkList(uid, keyword, filter);
        if (uid != null && result.getData() != null) {
            result.getData().forEach(course -> course.setIsPurchased(orderService.isCoursePurchased(uid, course.getId())));
        }
        return result;
    }

    @LogOperation("获取同步课程筛选项")
    @GetMapping("/resource/sync-course/options")
    public Result<Map<String, List<Map<String, Object>>>> getSyncCourseOptions() {
        return courseService.getSyncCourseOptions();
    }

    @LogOperation("收藏或取消收藏课程")
    @PostMapping("/course/collect")
    public Result<Void> collectCourse(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return courseService.collectCourse(uid, (String) params.get("courseId"), (Boolean) params.get("isCollect"));
    }

    @LogOperation("记录学习进度")
    @PostMapping("/course/learn")
    public Result<Void> recordLearning(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        Integer progress = (Integer) params.get("progress");
        return courseService.recordLearning(uid, (String) params.get("courseId"), progress != null ? progress : 0);
    }

    @LogOperation("获取我的课程")
    @GetMapping("/mine/course/list")
    public Result<List<Course>> getMyCourses() {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return courseService.getMyCourses(uid);
    }

    @LogOperation("获取我的收藏")
    @GetMapping("/mine/collection/list")
    public Result<List<Course>> getMyCollections() {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return courseService.getMyCollections(uid);
    }

    @LogOperation("获取已购课程")
    @GetMapping("/course/purchased")
    public Result<List<Course>> getPurchasedCourses() {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return Result.success(orderService.getPurchasedCourses(uid));
    }

    @LogOperation("创建课程订单")
    @PostMapping("/course/buy")
    public Result<CourseOrder> buyCourse(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return orderService.createOrder(uid, (String) params.get("courseId"));
    }

    @LogOperation("创建课程支付参数")
    @PostMapping("/course/pay")
    public Result<Map<String, Object>> createCoursePayParams(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return orderService.createWechatPayParams(uid, params == null ? null : (String) params.get("orderNo"));
    }

    @SuppressWarnings("unchecked")
    @LogOperation("确认课程虚拟支付")
    @PostMapping("/course/pay/confirm")
    public Result<String> confirmCourseVirtualPay(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        Map<String, Object> security = params == null ? null : (Map<String, Object>) params.get("security");
        return orderService.confirmVirtualPayment(uid, params == null ? null : (String) params.get("orderNo"), security);
    }

    @LogOperation("取消课程订单")
    @PostMapping("/course/order/cancel")
    public Result<Void> cancelCourseOrder(@RequestBody Map<String, Object> params) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return orderService.cancelOrder(uid, (String) params.get("orderNo"));
    }

    @LogOperation("模拟课程支付")
    @PostMapping("/course/pay-mock")
    public Result<Void> payMock(@RequestBody Map<String, Object> params) {
        try {
            orderService.paySuccess((String) params.get("orderNo"));
            return Result.success("支付成功", null);
        } catch (Exception e) {
            return Result.error("支付处理失败");
        }
    }

    @LogOperation("获取学习记录")
    @GetMapping("/mine/record/list")
    public Result<List<Map<String, Object>>> getMyStudyRecords() {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "请先登录");
        }
        return courseService.getMyStudyRecords(uid);
    }
}
