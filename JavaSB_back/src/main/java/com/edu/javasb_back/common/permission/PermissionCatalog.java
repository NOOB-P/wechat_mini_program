package com.edu.javasb_back.common.permission;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public final class PermissionCatalog {

    private PermissionCatalog() {
    }

    public static final String DASHBOARD_ANALYSIS_VIEW = "dashboard:analysis:view";

    public static final String SYSTEM_SCHOOL_LIST = "system:school:list";
    public static final String SYSTEM_SCHOOL_ADD = "system:school:add";
    public static final String SYSTEM_SCHOOL_EDIT = "system:school:edit";
    public static final String SYSTEM_SCHOOL_DELETE = "system:school:delete";
    public static final String SYSTEM_SCHOOL_IMPORT = "system:school:import";

    public static final String SYSTEM_CLASS_LIST = "system:class:list";
    public static final String SYSTEM_CLASS_ADD = "system:class:add";
    public static final String SYSTEM_CLASS_BATCH_ADD = "system:class:batch-add";
    public static final String SYSTEM_CLASS_EDIT = "system:class:edit";
    public static final String SYSTEM_CLASS_DELETE = "system:class:delete";
    public static final String SYSTEM_CLASS_IMPORT = "system:class:import";
    public static final String SYSTEM_CLASS_DETAIL = "system:class:detail";

    public static final String SYSTEM_STUDENT_LIST = "system:student:list";
    public static final String SYSTEM_STUDENT_ADD = "system:student:add";
    public static final String SYSTEM_STUDENT_EDIT = "system:student:edit";
    public static final String SYSTEM_STUDENT_DELETE = "system:student:delete";
    public static final String SYSTEM_STUDENT_IMPORT = "system:student:import";
    public static final String SYSTEM_STUDENT_BOUND_PARENTS = "system:student:bound-parents";

    public static final String EXAM_PROJECT_LIST = "exam:project:list";
    public static final String EXAM_PROJECT_OPTIONS = "exam:project:options";
    public static final String EXAM_PROJECT_ADD = "exam:project:add";
    public static final String EXAM_PROJECT_EDIT = "exam:project:edit";
    public static final String EXAM_PROJECT_DELETE = "exam:project:delete";
    public static final String EXAM_PROJECT_DETAIL = "exam:project:detail";
    public static final String EXAM_PROJECT_STUDENTS = "exam:project:students";
    public static final String EXAM_PROJECT_SCORE_SUMMARY = "exam:project:score-summary";
    public static final String EXAM_PROJECT_SCORE_LIST = "exam:project:score-list";
    public static final String EXAM_PROJECT_SCORE_TEMPLATE = "exam:project:score-template";
    public static final String EXAM_PROJECT_SCORE_IMPORT = "exam:project:score-import";
    public static final String EXAM_PROJECT_SCORE_SAVE = "exam:project:score-save";
    public static final String EXAM_PROJECT_PAPER_IMPORT = "exam:project:paper-import";
    public static final String EXAM_PROJECT_PAPER_UPLOAD = "exam:project:paper-upload";
    public static final String EXAM_CLASS_LIST = "exam:class:list";
    public static final String EXAM_CLASS_ADD = "exam:class:add";
    public static final String EXAM_CLASS_EDIT = "exam:class:edit";
    public static final String EXAM_CLASS_DELETE = "exam:class:delete";

    public static final String ORDER_VIP_LIST = "order:vip:list";
    public static final String ORDER_COURSE_LIST = "order:course:list";
    public static final String ORDER_PRINT_LIST = "order:print:list";
    public static final String ORDER_PRINT_DETAIL = "order:print:detail";
    public static final String ORDER_PRINT_STATUS = "order:print:status";

    public static final String COURSE_MANAGE_LIST = "course:manage:list";
    public static final String COURSE_MANAGE_ADD = "course:manage:add";
    public static final String COURSE_MANAGE_EDIT = "course:manage:edit";
    public static final String COURSE_MANAGE_DELETE = "course:manage:delete";
    public static final String COURSE_MANAGE_STATUS = "course:manage:status";

    public static final String PAPER_MANAGE_LIST = "paper:manage:list";
    public static final String PAPER_MANAGE_SAVE = "paper:manage:save";
    public static final String PAPER_MANAGE_DELETE = "paper:manage:delete";
    public static final String PAPER_MANAGE_UPLOAD = "paper:manage:upload";
    public static final String PAPER_SUBJECT_LIST = "paper:subject:list";
    public static final String PAPER_SUBJECT_SAVE = "paper:subject:save";
    public static final String PAPER_SUBJECT_DELETE = "paper:subject:delete";

    public static final String PAYMENT_VIP_LIST = "payment:vip:list";
    public static final String PAYMENT_VIP_EDIT = "payment:vip:edit";
    public static final String PAYMENT_PRINT_LIST = "payment:print:list";
    public static final String PAYMENT_PRINT_EDIT = "payment:print:edit";

    public static final String SUPPORT_FAQ_LIST = "support:faq:list";
    public static final String SUPPORT_FAQ_ADD = "support:faq:add";
    public static final String SUPPORT_FAQ_EDIT = "support:faq:edit";
    public static final String SUPPORT_FAQ_DELETE = "support:faq:delete";
    public static final String SUPPORT_FAQ_CATEGORY_LIST = "support:faq-category:list";
    public static final String SUPPORT_FAQ_CATEGORY_ADD = "support:faq-category:add";
    public static final String SUPPORT_FAQ_CATEGORY_EDIT = "support:faq-category:edit";
    public static final String SUPPORT_FAQ_CATEGORY_DELETE = "support:faq-category:delete";

    public static final String SUPPORT_WECHAT_LIST = "support:wechat:list";
    public static final String SUPPORT_WECHAT_ADD = "support:wechat:add";
    public static final String SUPPORT_WECHAT_EDIT = "support:wechat:edit";
    public static final String SUPPORT_WECHAT_DELETE = "support:wechat:delete";

    public static final String SYSTEM_USER_LIST = "system:user:list";
    public static final String SYSTEM_USER_ADD = "system:user:add";
    public static final String SYSTEM_USER_EDIT = "system:user:edit";
    public static final String SYSTEM_USER_DELETE = "system:user:delete";
    public static final String SYSTEM_USER_IMPORT = "system:user:import";
    public static final String SYSTEM_USER_TEMPLATE = "system:user:template";

    public static final String SYSTEM_ROLE_LIST = "system:role:list";

    public static final String SYSTEM_PERMISSION_LIST = "system:permission:list";
    public static final String SYSTEM_PERMISSION_EDIT = "system:permission:edit";
    public static final String SYSTEM_PERMISSION_OPTIONS = "system:permission:options";
    public static final String SYSTEM_NOTIFICATION_LIST = "system:notification:list";
    public static final String SYSTEM_NOTIFICATION_SAVE = "system:notification:save";
    public static final String SYSTEM_NOTIFICATION_DELETE = "system:notification:delete";

    public static final String SYSTEM_LOG_LIST = "system:log:list";
    public static final String SYSTEM_LOG_DELETE = "system:log:delete";

    public static final List<PermissionGroup> GROUPS = List.of(
            new PermissionGroup(
                    DASHBOARD_ANALYSIS_VIEW,
                    "数据统计",
                    "/dashboard/analysis",
                    "ri:pie-chart-line",
                    List.of(DASHBOARD_ANALYSIS_VIEW)
            ),
            new PermissionGroup(
                    SYSTEM_SCHOOL_LIST,
                    "学校数据",
                    "/core-business/school",
                    "ri:database-2-line",
                    List.of(
                            SYSTEM_SCHOOL_LIST,
                            SYSTEM_SCHOOL_ADD,
                            SYSTEM_SCHOOL_EDIT,
                            SYSTEM_SCHOOL_DELETE,
                            SYSTEM_SCHOOL_IMPORT
                    )
            ),
            new PermissionGroup(
                    SYSTEM_CLASS_LIST,
                    "班级数据",
                    "/core-business/sys-class",
                    "ri:team-line",
                    List.of(
                            SYSTEM_CLASS_LIST,
                            SYSTEM_CLASS_ADD,
                            SYSTEM_CLASS_BATCH_ADD,
                            SYSTEM_CLASS_EDIT,
                            SYSTEM_CLASS_DELETE,
                            SYSTEM_CLASS_IMPORT,
                            SYSTEM_CLASS_DETAIL
                    )
            ),
            new PermissionGroup(
                    SYSTEM_STUDENT_LIST,
                    "学生数据",
                    "/core-business/student",
                    "ri:graduation-cap-line",
                    List.of(
                            SYSTEM_STUDENT_LIST,
                            SYSTEM_STUDENT_ADD,
                            SYSTEM_STUDENT_EDIT,
                            SYSTEM_STUDENT_DELETE,
                            SYSTEM_STUDENT_IMPORT,
                            SYSTEM_STUDENT_BOUND_PARENTS
                    )
            ),
            new PermissionGroup(
                    EXAM_PROJECT_LIST,
                    "考试项目管理",
                    "/exam-hub/project",
                    "ri:line-chart-line",
                    List.of(
                            EXAM_PROJECT_LIST,
                            EXAM_PROJECT_OPTIONS,
                            EXAM_PROJECT_ADD,
                            EXAM_PROJECT_EDIT,
                            EXAM_PROJECT_DELETE,
                            EXAM_PROJECT_DETAIL,
                            EXAM_PROJECT_STUDENTS,
                            EXAM_PROJECT_SCORE_SUMMARY,
                            EXAM_PROJECT_SCORE_LIST,
                            EXAM_PROJECT_SCORE_TEMPLATE,
                            EXAM_PROJECT_SCORE_IMPORT,
                            EXAM_PROJECT_SCORE_SAVE,
                            EXAM_PROJECT_PAPER_IMPORT,
                            EXAM_PROJECT_PAPER_UPLOAD,
                            EXAM_CLASS_LIST,
                            EXAM_CLASS_ADD,
                            EXAM_CLASS_EDIT,
                            EXAM_CLASS_DELETE
                    )
            ),
            new PermissionGroup(
                    ORDER_VIP_LIST,
                    "VIP订单管理",
                    "/order/vip",
                    "ri:file-list-3-line",
                    List.of(ORDER_VIP_LIST)
            ),
            new PermissionGroup(
                    ORDER_COURSE_LIST,
                    "课程订单管理",
                    "/order/course",
                    "ri:file-list-3-line",
                    List.of(ORDER_COURSE_LIST)
            ),
            new PermissionGroup(
                    ORDER_PRINT_LIST,
                    "打印订单管理",
                    "/order/print",
                    "ri:file-list-3-line",
                    List.of(
                            ORDER_PRINT_LIST,
                            ORDER_PRINT_DETAIL,
                            ORDER_PRINT_STATUS
                    )
            ),
            new PermissionGroup(
                    COURSE_MANAGE_LIST,
                    "课程管理",
                    "/course-study/course",
                    "ri:book-open-line",
                    List.of(
                            COURSE_MANAGE_LIST,
                            COURSE_MANAGE_ADD,
                            COURSE_MANAGE_EDIT,
                            COURSE_MANAGE_DELETE,
                            COURSE_MANAGE_STATUS
                    )
            ),
            new PermissionGroup(
                    PAPER_MANAGE_LIST,
                    "名校试卷管理",
                    "/paper-manage/index",
                    "ri:file-paper-2-line",
                    List.of(
                            PAPER_MANAGE_LIST,
                            PAPER_MANAGE_SAVE,
                            PAPER_MANAGE_DELETE,
                            PAPER_MANAGE_UPLOAD,
                            PAPER_SUBJECT_LIST,
                            PAPER_SUBJECT_SAVE,
                            PAPER_SUBJECT_DELETE
                    )
            ),
            new PermissionGroup(
                    PAYMENT_VIP_LIST,
                    "会员套餐设置",
                    "/payment/vip",
                    "ri:money-cny-box-line",
                    List.of(
                            PAYMENT_VIP_LIST,
                            PAYMENT_VIP_EDIT
                    )
            ),
            new PermissionGroup(
                    PAYMENT_PRINT_LIST,
                    "打印价格设置",
                    "/payment/print-price",
                    "ri:money-cny-box-line",
                    List.of(
                            PAYMENT_PRINT_LIST,
                            PAYMENT_PRINT_EDIT
                    )
            ),
            new PermissionGroup(
                    SUPPORT_FAQ_LIST,
                    "FAQ管理",
                    "/support-interaction/faq",
                    "ri:customer-service-2-line",
                    List.of(
                            SUPPORT_FAQ_LIST,
                            SUPPORT_FAQ_ADD,
                            SUPPORT_FAQ_EDIT,
                            SUPPORT_FAQ_DELETE,
                            SUPPORT_FAQ_CATEGORY_LIST,
                            SUPPORT_FAQ_CATEGORY_ADD,
                            SUPPORT_FAQ_CATEGORY_EDIT,
                            SUPPORT_FAQ_CATEGORY_DELETE
                    )
            ),
            new PermissionGroup(
                    SUPPORT_WECHAT_LIST,
                    "企业微信客服",
                    "/support-interaction/wechat",
                    "ri:customer-service-2-line",
                    List.of(
                            SUPPORT_WECHAT_LIST,
                            SUPPORT_WECHAT_ADD,
                            SUPPORT_WECHAT_EDIT,
                            SUPPORT_WECHAT_DELETE
                    )
            ),
            new PermissionGroup(
                    SYSTEM_USER_LIST,
                    "用户管理",
                    "/system/user",
                    "ri:user-3-line",
                    List.of(
                            SYSTEM_USER_LIST,
                            SYSTEM_USER_ADD,
                            SYSTEM_USER_EDIT,
                            SYSTEM_USER_DELETE,
                            SYSTEM_USER_IMPORT,
                            SYSTEM_USER_TEMPLATE
                    )
            ),
            new PermissionGroup(
                    SYSTEM_ROLE_LIST,
                    "角色管理",
                    "/system/role",
                    "ri:user-3-line",
                    List.of(SYSTEM_ROLE_LIST)
            ),
            new PermissionGroup(
                    SYSTEM_PERMISSION_LIST,
                    "角色权限管理",
                    "/system/content-management",
                    "ri:user-3-line",
                    List.of(
                            SYSTEM_PERMISSION_LIST,
                            SYSTEM_PERMISSION_EDIT,
                            SYSTEM_PERMISSION_OPTIONS
                    )
            ),
            new PermissionGroup(
                    SYSTEM_NOTIFICATION_LIST,
                    "系统通知管理",
                    "/system/notification",
                    "ri:notification-3-line",
                    List.of(
                            SYSTEM_NOTIFICATION_LIST,
                            SYSTEM_NOTIFICATION_SAVE,
                            SYSTEM_NOTIFICATION_DELETE
                    )
            ),
            new PermissionGroup(
                    SYSTEM_LOG_LIST,
                    "日志管理",
                    "/log",
                    "ri:file-list-2-line",
                    List.of(
                            SYSTEM_LOG_LIST,
                            SYSTEM_LOG_DELETE
                    )
            )
    );

    private static final Map<String, PermissionGroup> GROUP_MAP = buildGroupMap();
    private static final Set<String> ALL_PERMISSION_CODES = buildAllPermissionCodes();
    private static final Map<String, Integer> ROLE_PRIORITY = Map.of(
            "super_admin", 100,
            "admin", 80,
            "parent", 10
    );
    private static final Set<String> BACKOFFICE_ROLE_CODES = Set.of("super_admin", "admin");

    public static List<PermissionGroup> getGroups() {
        return GROUPS;
    }

    public static PermissionGroup getGroup(String menuPermission) {
        return GROUP_MAP.get(menuPermission);
    }

    public static Set<String> expandMenuPermissions(Collection<String> menuPermissions) {
        LinkedHashSet<String> expanded = new LinkedHashSet<>();
        if (menuPermissions == null) {
            return expanded;
        }
        for (String menuPermission : menuPermissions) {
            PermissionGroup group = getGroup(menuPermission);
            if (group == null) {
                continue;
            }
            expanded.addAll(group.permissionCodes());
        }
        return expanded;
    }

    public static Set<String> getAllPermissionCodes() {
        return ALL_PERMISSION_CODES;
    }

    public static boolean isBackofficeRole(String roleCode) {
        return BACKOFFICE_ROLE_CODES.contains(roleCode);
    }

    public static int getRolePriority(String roleCode) {
        if (roleCode == null) {
            return 0;
        }
        return ROLE_PRIORITY.getOrDefault(roleCode, 0);
    }

    private static Map<String, PermissionGroup> buildGroupMap() {
        LinkedHashMap<String, PermissionGroup> groupMap = new LinkedHashMap<>();
        for (PermissionGroup group : GROUPS) {
            groupMap.put(group.menuPermission(), group);
        }
        return groupMap;
    }

    private static Set<String> buildAllPermissionCodes() {
        LinkedHashSet<String> permissionCodes = new LinkedHashSet<>();
        for (PermissionGroup group : GROUPS) {
            permissionCodes.addAll(group.permissionCodes());
        }
        return permissionCodes;
    }

    public record PermissionGroup(
            String menuPermission,
            String title,
            String routePath,
            String icon,
            List<String> permissionCodes
    ) {
        public PermissionGroup {
            Objects.requireNonNull(menuPermission, "menuPermission must not be null");
            Objects.requireNonNull(title, "title must not be null");
            permissionCodes = permissionCodes == null ? List.of() : List.copyOf(permissionCodes);
        }
    }
}
