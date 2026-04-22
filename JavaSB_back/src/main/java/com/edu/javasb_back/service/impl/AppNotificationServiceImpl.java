package com.edu.javasb_back.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.edu.javasb_back.model.entity.Course;
import com.edu.javasb_back.model.entity.CourseOrder;
import com.edu.javasb_back.model.entity.ExamStudentScore;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.model.entity.PrintOrder;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysNotification;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.model.entity.VipOrder;
import com.edu.javasb_back.model.vo.AppNotificationVO;
import com.edu.javasb_back.repository.CourseOrderRepository;
import com.edu.javasb_back.repository.CourseRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.repository.PrintOrderRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysNotificationRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.repository.VipOrderRepository;
import com.edu.javasb_back.service.AppNotificationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AppNotificationServiceImpl implements AppNotificationService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 50;
    private static final int SCORE_NOTICE_LIMIT = 8;
    private static final int ORDER_NOTICE_LIMIT = 8;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private StudentParentBindingRepository studentParentBindingRepository;

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Autowired
    private ExamStudentScoreRepository examStudentScoreRepository;

    @Autowired
    private ExamSubjectRepository examSubjectRepository;

    @Autowired
    private VipOrderRepository vipOrderRepository;

    @Autowired
    private CourseOrderRepository courseOrderRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PrintOrderRepository printOrderRepository;

    @Autowired
    private SysNotificationRepository sysNotificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public List<AppNotificationVO> getUserNotifications(Long uid, Integer limit) {
        if (uid == null) {
            return List.of();
        }

        Optional<SysAccount> accountOptional = sysAccountRepository.findById(uid);
        if (accountOptional.isEmpty()) {
            return List.of();
        }

        SysAccount account = accountOptional.get();
        List<NotificationWrapper> notifications = new ArrayList<>();

        // 获取动态已读ID
        Set<String> dynamicReadIds = new HashSet<>();
        if (StringUtils.hasText(account.getReadNotificationIds())) {
            try {
                dynamicReadIds = objectMapper.readValue(account.getReadNotificationIds(), new TypeReference<Set<String>>() {});
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        appendScoreNotifications(uid, notifications, dynamicReadIds);
        appendCourseNotifications(uid, notifications, dynamicReadIds);
        appendVipNotifications(uid, notifications, dynamicReadIds);
        appendVipExpireNotification(account, notifications, dynamicReadIds);
        appendPrintNotifications(account, notifications, dynamicReadIds);
        appendSystemNotifications(uid, notifications);

        notifications.sort(Comparator.comparing(NotificationWrapper::time, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        return notifications.stream()
                .limit(normalizeLimit(limit))
                .map(NotificationWrapper::payload)
                .toList();
    }

    private void appendSystemNotifications(Long uid, List<NotificationWrapper> notifications) {
        List<SysNotification> sysNotifications = sysNotificationRepository.findPublishedByUid(uid);
        for (SysNotification sys : sysNotifications) {
            boolean isNew = true;
            if (sys.getTargetType() == 1) {
                isNew = sys.getIsRead() == null || sys.getIsRead() == 0;
            } else if (StringUtils.hasText(sys.getReadUids())) {
                try {
                    Set<Long> readUids = objectMapper.readValue(sys.getReadUids(), new TypeReference<Set<Long>>() {});
                    if (readUids.contains(uid)) {
                        isNew = false;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            addNotification(
                    notifications,
                    "sys-" + sys.getId(),
                    sys.getCategory() != null ? sys.getCategory() : "system",
                    sys.getLevel() != null ? sys.getLevel() : "info",
                    sys.getTitle(),
                    sys.getContent(),
                    sys.getCreateTime() != null ? sys.getCreateTime() : LocalDateTime.now(),
                    sys.getActionText(),
                    sys.getActionPath(),
                    isNew
            );
        }
    }

    private void appendScoreNotifications(Long uid, List<NotificationWrapper> notifications, Set<String> dynamicReadIds) {
        List<StudentParentBinding> bindings = studentParentBindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) {
            return;
        }

        List<String> studentIds = bindings.stream()
                .map(StudentParentBinding::getStudentId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        if (studentIds.isEmpty()) {
            return;
        }

        Map<String, SysStudent> studentMap = sysStudentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(SysStudent::getId, student -> student, (left, right) -> left));
        List<String> studentNos = studentMap.values().stream()
                .map(SysStudent::getStudentNo)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        if (studentNos.isEmpty()) {
            return;
        }

        List<ExamStudentScore> scores = studentNos.stream()
                .map(examStudentScoreRepository::findByStudentNo)
                .flatMap(Collection::stream)
                .filter(score -> Boolean.TRUE.equals(score.getScoreEntered()))
                .sorted(Comparator.comparing(ExamStudentScore::getUpdateTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(SCORE_NOTICE_LIMIT)
                .toList();
        if (scores.isEmpty()) {
            return;
        }

        Set<String> subjectIds = scores.stream()
                .map(ExamStudentScore::getSubjectId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        Map<String, ExamSubject> subjectMap = examSubjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(ExamSubject::getId, subject -> subject, (left, right) -> left));
        Map<String, SysStudent> studentNoMap = studentMap.values().stream()
                .filter(student -> StringUtils.hasText(student.getStudentNo()))
                .collect(Collectors.toMap(SysStudent::getStudentNo, student -> student, (left, right) -> left));

        for (ExamStudentScore score : scores) {
            ExamSubject subject = subjectMap.get(score.getSubjectId());
            SysStudent student = studentNoMap.get(score.getStudentNo());
            String studentName = firstNonEmpty(score.getStudentName(), student == null ? null : student.getName(), "学生");
            String subjectName = subject == null ? "考试" : firstNonEmpty(subject.getSubjectName(), "考试");

            String notificationId = "score-" + score.getId();
            addNotification(
                    notifications,
                    notificationId,
                    "score",
                    "primary",
                    studentName + "的" + subjectName + "成绩已发布",
                    "本次成绩为 " + formatDecimal(score.getTotalScore()) + " 分，快去查看最新学情分析和试卷报告。",
                    fallbackTime(score.getUpdateTime(), score.getCreateTime()),
                    "立即查看",
                    "/subpkg_analysis/pages/score/index",
                    !dynamicReadIds.contains(notificationId)
            );
        }
    }

    private void appendCourseNotifications(Long uid, List<NotificationWrapper> notifications, Set<String> dynamicReadIds) {
        List<CourseOrder> orders = courseOrderRepository.findByUserUidAndPaymentStatus(uid, 1).stream()
                .sorted(Comparator.comparing(CourseOrder::getCreateTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(ORDER_NOTICE_LIMIT)
                .toList();
        if (orders.isEmpty()) {
            return;
        }

        List<String> courseIds = orders.stream()
                .map(CourseOrder::getCourseId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        Map<String, Course> courseMap = courseRepository.findAllByIdSql(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, course -> course, (left, right) -> left));

        for (CourseOrder order : orders) {
            Course course = courseMap.get(order.getCourseId());
            String courseTitle = course == null ? "课程" : firstNonEmpty(course.getTitle(), "课程");
            String actionPath = course == null
                    ? "/subpkg_mine/pages/mine/order-list?tab=course"
                    : "/subpkg_course/pages/course/detail?id=" + order.getCourseId();

            String notificationId = "course-" + order.getId();
            addNotification(
                    notifications,
                    notificationId,
                    "course",
                    "success",
                    "课程购买成功",
                    "《" + courseTitle + "》已加入你的课程列表，现在就可以开始学习了。",
                    fallbackTime(order.getUpdateTime(), order.getCreateTime()),
                    "去学习",
                    actionPath,
                    !dynamicReadIds.contains(notificationId)
            );
        }
    }

    private void appendVipNotifications(Long uid, List<NotificationWrapper> notifications, Set<String> dynamicReadIds) {
        List<VipOrder> orders = vipOrderRepository.findByUserUidOrderByCreateTimeDesc(uid).stream()
                .filter(order -> Objects.equals(order.getPaymentStatus(), 1))
                .limit(ORDER_NOTICE_LIMIT)
                .toList();

        for (VipOrder order : orders) {
            boolean svip = containsIgnoreCase(order.getPackageType(), "SVIP");
            String roleName = svip ? "SVIP" : "VIP";
            String period = StringUtils.hasText(order.getPeriod()) ? order.getPeriod() : "当前周期";

            String notificationId = "vip-" + order.getId();
            addNotification(
                    notifications,
                    notificationId,
                    "vip",
                    svip ? "warning" : "success",
                    roleName + "开通成功",
                    roleName + "权益已生效，本次开通周期为" + period + "，可前往会员页查看完整权益。",
                    fallbackTime(order.getUpdateTime(), order.getCreateTime()),
                    "查看权益",
                    "/subpkg_course/pages/vip/recharge",
                    !dynamicReadIds.contains(notificationId)
            );
        }
    }

    private void appendVipExpireNotification(SysAccount account, List<NotificationWrapper> notifications, Set<String> dynamicReadIds) {
        boolean svipActive = Objects.equals(account.getIsSvip(), 1)
                && account.getSvipExpireTime() != null
                && !account.getSvipExpireTime().isBefore(LocalDateTime.now());
        boolean vipActive = Objects.equals(account.getIsVip(), 1)
                && account.getVipExpireTime() != null
                && !account.getVipExpireTime().isBefore(LocalDateTime.now());

        LocalDateTime expireTime = svipActive ? account.getSvipExpireTime() : account.getVipExpireTime();
        if (expireTime == null || (!vipActive && !svipActive)) {
            return;
        }

        long days = ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), expireTime.toLocalDate());
        if (days > 7) {
            return;
        }

        String roleName = svipActive ? "SVIP" : "VIP";
        String contentPrefix = days < 0 ? "已于" : "将于";
        String title = days < 0 ? roleName + "已到期" : roleName + "即将到期";
        String actionText = days < 0 ? "立即续费" : "去续费";

        String notificationId = "vip-expire-" + account.getUid();
        addNotification(
                notifications,
                notificationId,
                "expire",
                days <= 3 ? "danger" : "warning",
                title,
                "你的" + roleName + "权益" + contentPrefix + " " + formatTime(expireTime) + " 到期，建议及时续费，避免权益中断。",
                LocalDateTime.now(),
                actionText,
                "/subpkg_course/pages/vip/recharge",
                !dynamicReadIds.contains(notificationId)
        );
    }

    private void appendPrintNotifications(SysAccount account, List<NotificationWrapper> notifications, Set<String> dynamicReadIds) {
        Map<Long, PrintOrder> orderMap = new LinkedHashMap<>();

        if (StringUtils.hasText(account.getPhone())) {
            for (PrintOrder order : printOrderRepository.findByUserPhoneOrderByCreateTimeDesc(account.getPhone())) {
                orderMap.putIfAbsent(order.getId(), order);
            }
        }
        if (StringUtils.hasText(account.getNickname())) {
            for (PrintOrder order : printOrderRepository.findByUserNameOrderByCreateTimeDesc(account.getNickname())) {
                orderMap.putIfAbsent(order.getId(), order);
            }
        }

        List<PrintOrder> orders = orderMap.values().stream()
                .sorted(Comparator.comparing(this::getPrintOrderSortTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(ORDER_NOTICE_LIMIT)
                .toList();

        for (PrintOrder order : orders) {
            if (order.getOrderStatus() != null && order.getOrderStatus() >= 2) {
                String notificationId = "print-created-" + order.getId();
                addNotification(
                        notifications,
                        notificationId,
                        "print",
                        "primary",
                        "打印下单成功",
                        "订单 " + firstNonEmpty(order.getOrderNo(), "") + " 已提交，文档《" + firstNonEmpty(order.getDocumentName(), "资料") + "》正在进入打印流程。",
                        fallbackTime(order.getCreateTime(), order.getUpdateTime()),
                        "查看订单",
                        "/subpkg_mine/pages/mine/order-list?tab=print",
                        !dynamicReadIds.contains(notificationId)
                );
            }

            if (Objects.equals(order.getOrderStatus(), 3)) {
                String notificationId = "print-delivery-" + order.getId();
                addNotification(
                        notifications,
                        notificationId,
                        "delivery",
                        "warning",
                        "打印订单配送中",
                        "订单 " + firstNonEmpty(order.getOrderNo(), "") + " 已完成打印，当前正在配送途中，请注意查收。",
                        fallbackTime(order.getUpdateTime(), order.getCreateTime()),
                        "查看订单",
                        "/subpkg_mine/pages/mine/order-list?tab=print",
                        !dynamicReadIds.contains(notificationId)
                );
            }

            if (Objects.equals(order.getOrderStatus(), 4)) {
                String notificationId = "print-arrived-" + order.getId();
                addNotification(
                        notifications,
                        notificationId,
                        "delivery",
                        "success",
                        "打印订单已送达",
                        "订单 " + firstNonEmpty(order.getOrderNo(), "") + " 已完成配送，如已收到请及时查阅资料。",
                        fallbackTime(order.getUpdateTime(), order.getCreateTime()),
                        "查看订单",
                        "/subpkg_mine/pages/mine/order-list?tab=print",
                        !dynamicReadIds.contains(notificationId)
                );
            }
        }
    }

    private void addNotification(
            List<NotificationWrapper> notifications,
            String id,
            String category,
            String level,
            String title,
            String content,
            LocalDateTime time,
            String actionText,
            String actionPath,
            Boolean isNew
    ) {
        AppNotificationVO notification = new AppNotificationVO();
        notification.setId(id);
        notification.setCategory(category);
        notification.setLevel(level);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setTime(formatTime(time));
        notification.setActionText(actionText);
        notification.setActionPath(actionPath);
        notification.setIsNew(isNew);
        notifications.add(new NotificationWrapper(time, notification));
    }

    private String firstNonEmpty(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private boolean containsIgnoreCase(String source, String keyword) {
        return StringUtils.hasText(source) && source.toUpperCase(Locale.ROOT).contains(keyword.toUpperCase(Locale.ROOT));
    }

    private LocalDateTime fallbackTime(LocalDateTime primary, LocalDateTime secondary) {
        return primary != null ? primary : secondary;
    }

    private LocalDateTime getPrintOrderSortTime(PrintOrder order) {
        return fallbackTime(order.getUpdateTime(), order.getCreateTime());
    }

    private String formatDecimal(Double value) {
        if (value == null) {
            return "0";
        }
        if (Math.abs(value - value.longValue()) < 0.000001D) {
            return String.valueOf(value.longValue());
        }
        return BigDecimal.valueOf(value).stripTrailingZeros().toPlainString();
    }

    private String formatTime(LocalDateTime time) {
        return time == null ? DATE_TIME_FORMATTER.format(LocalDateTime.now()) : DATE_TIME_FORMATTER.format(time);
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private record NotificationWrapper(LocalDateTime time, AppNotificationVO payload) {
    }
}
