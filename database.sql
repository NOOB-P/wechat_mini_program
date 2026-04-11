DROP DATABASE IF EXISTS edu_data;
CREATE DATABASE edu_data CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE edu_data;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 系统统一账号与权限模块
-- ---------------------------------------------------------

-- 1. 系统角色表 (Permissions/Roles)
DROP TABLE IF EXISTS `sys_roles`;
CREATE TABLE `sys_roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色唯一ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称 (如: 家长, 后台管理, 超级管理员)',
    `role_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色标识符 (如: parent, admin, super_admin)',
    `description` VARCHAR(255) COMMENT '角色描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='系统角色权限表';

-- 2. 统一账号表 (Accounts)
DROP TABLE IF EXISTS `sys_accounts`;
CREATE TABLE `sys_accounts` (
    `uid` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一标识 UID',
    `username` VARCHAR(50) UNIQUE COMMENT '登录用户名',
    `nickname` VARCHAR(100) NOT NULL DEFAULT '新用户' COMMENT '用户昵称',
    `avatar` VARCHAR(255) COMMENT '用户头像URL',
    `password` VARCHAR(255) COMMENT '加密后的登录密码',
    `phone` VARCHAR(20) UNIQUE COMMENT '绑定手机号',
    `email` VARCHAR(100) UNIQUE COMMENT '绑定邮箱',
    `wxid` VARCHAR(100) UNIQUE COMMENT '微信 OpenID/UnionID',
    `qqid` VARCHAR(100) UNIQUE COMMENT 'QQ OpenID',
    `role_id` INT NOT NULL COMMENT '关联角色ID',
    `is_vip` TINYINT DEFAULT NULL COMMENT '是否VIP: 1-是, 0-否 (仅家长角色有效)',
    `is_svip` TINYINT DEFAULT NULL COMMENT '是否SVIP: 1-是, 0-否 (仅家长角色有效)',
    `vip_expire_time` DATETIME DEFAULT NULL COMMENT 'VIP过期时间',
    `online_status` ENUM('online', 'offline', 'banned') DEFAULT 'offline' COMMENT '在线状态: online-在线, offline-离线, banned-封禁',
    `is_bound_student` TINYINT DEFAULT 0 COMMENT '是否已绑定学生: 1-是, 0-否',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用: 1-启用, 0-禁用',
    `last_login_time` DATETIME COMMENT '最后登录时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建日期',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT `fk_account_role` FOREIGN KEY (`role_id`) REFERENCES `sys_roles` (`id`)
) ENGINE=InnoDB COMMENT='系统统一账号表';

-- 2.1 用户管理模块分配表
DROP TABLE IF EXISTS `sys_user_modules`;
CREATE TABLE `sys_user_modules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `uid` BIGINT NOT NULL COMMENT '关联 sys_accounts.uid',
    `module_path` VARCHAR(255) NOT NULL COMMENT '模块路由路径 (例如: /order)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_uid` (`uid`),
    CONSTRAINT `fk_user_module_uid` FOREIGN KEY (`uid`) REFERENCES `sys_accounts` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户管理模块分配表';

-- 3. 会员等级配置表
DROP TABLE IF EXISTS `sys_vip_config`;
CREATE TABLE `sys_vip_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tier_code` VARCHAR(20) NOT NULL COMMENT '等级标识：VIP, SVIP',
    `title` VARCHAR(50) NOT NULL COMMENT '显示标题',
    `sub_title` VARCHAR(100) COMMENT '副标题',
    `benefits` TEXT COMMENT '权益列表 (JSON)',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用：0-禁用, 1-启用',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='会员等级配置表';

-- 4. 会员价格套餐表
DROP TABLE IF EXISTS `sys_vip_pricing`;
CREATE TABLE `sys_vip_pricing` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `vip_id` INT NOT NULL COMMENT '关联 sys_vip_config.id',
    `pkg_name` VARCHAR(20) NOT NULL COMMENT '套餐名称：月包, 季包, 年包',
    `pkg_desc` VARCHAR(50) COMMENT '套餐描述：如 一学期',
    `current_price` DECIMAL(10,2) NOT NULL COMMENT '当前售价',
    `original_price` DECIMAL(10,2) COMMENT '原价',
    `duration_months` INT NOT NULL COMMENT '有效时长(月)',
    `is_best_value` TINYINT DEFAULT 0 COMMENT '是否为营销推荐',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    CONSTRAINT `fk_vip_pricing_vip_id` FOREIGN KEY (`vip_id`) REFERENCES `sys_vip_config` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='会员价格套餐表';

-- 初始化会员配置数据
INSERT INTO `sys_vip_config` (`id`, `tier_code`, `title`, `sub_title`, `benefits`, `is_enabled`, `sort_order`) VALUES 
(1, 'VIP', 'VIP 基础版', '适合个人学习，包含基础题库与分析功能', '["基础题库访问", "错题本功能", "月度学习报告"]', 1, 1),
(2, 'SVIP', 'SVIP 专业版', '全能学习助手，解锁所有高级分析与名师课程', '["全站题库无限制访问", "AI 智能解析", "名师精讲视频", "专属客服优先响应"]', 1, 2);

-- 初始化会员价格数据
INSERT INTO `sys_vip_pricing` (`vip_id`, `pkg_name`, `pkg_desc`, `current_price`, `original_price`, `duration_months`, `is_best_value`, `sort_order`) VALUES 
(1, '月包', '', 29.00, 39.00, 1, 0, 1),
(1, '季包', '一学期', 99.00, 129.00, 4, 1, 2),
(1, '年包', '', 299.00, 399.00, 12, 0, 3),
(2, '月包', '', 59.00, 79.00, 1, 0, 1),
(2, '季包', '一学期', 199.00, 249.00, 4, 1, 2),
(2, '年包', '', 599.00, 799.00, 12, 0, 3);


-- ---------------------------------------------------------
-- 核心业务模块
-- ---------------------------------------------------------

-- 3. 学校结构表 (冗余设计)
DROP TABLE IF EXISTS `schools`;
CREATE TABLE `schools` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内部记录ID',
    `school_id` VARCHAR(50) NOT NULL UNIQUE COMMENT '学校唯一标识',
    `province` VARCHAR(50) COMMENT '省份',
    `city` VARCHAR(50) COMMENT '城市',
    `name` VARCHAR(100) NOT NULL COMMENT '学校名称',
    `type` VARCHAR(20) DEFAULT 'school' COMMENT '节点类型',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='学校基础信息表';

-- 3.1 全局班级表
DROP TABLE IF EXISTS `sys_classes`;
CREATE TABLE `sys_classes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内部记录ID',
    `classid` VARCHAR(50) NOT NULL UNIQUE COMMENT '班级唯一标识ID',
    `school_id` VARCHAR(50) NOT NULL COMMENT '关联的学校ID',
    `grade` VARCHAR(50) NOT NULL COMMENT '年级',
    `alias` VARCHAR(100) COMMENT '班级别名',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT `fk_sysclass_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='全局班级管理表';

-- 4. 学生档案表 (包含状态和会员冗余)
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '学生唯一ID',
    `student_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
    `name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
    `school_id` VARCHAR(50) COMMENT '关联的学校ID',
    `class_id` VARCHAR(50) COMMENT '关联的班级ID(classid)',
    `school` VARCHAR(100) COMMENT '所在学校(冗余)',
    `grade` VARCHAR(50) COMMENT '所在年级(冗余)',
    `class_name` VARCHAR(50) COMMENT '所在班级(冗余)',
    `bound_count` INT DEFAULT 0 COMMENT '绑定家长数量',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='学生档案表';

-- 4.1 学生-家长绑定表 (一对多：一个学生可被多名家长绑定，但一名家长只能绑定一名学生)
DROP TABLE IF EXISTS `student_parent_bindings`;
CREATE TABLE `student_parent_bindings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '绑定ID',
    `student_id` VARCHAR(50) NOT NULL COMMENT '学生唯一ID',
    `parent_uid` BIGINT NOT NULL COMMENT '家长用户唯一ID (sys_accounts.uid)',
    `binding_type` VARCHAR(20) DEFAULT 'parent' COMMENT '绑定类型',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    -- 核心约束：确保一个家长账号（即一个手机号）只能存在一条绑定记录
    UNIQUE KEY `uk_parent_single` (`parent_uid`), 
    CONSTRAINT `fk_binding_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
    CONSTRAINT `fk_binding_parent` FOREIGN KEY (`parent_uid`) REFERENCES `sys_accounts` (`uid`)
) ENGINE=InnoDB COMMENT='学生与家长账号绑定关系表 (1个家长限绑1名学生，1名学生支持多名家长共同管理)';

-- 5. 考试信息与成绩表 (兼容历史版本结构)
DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '考试唯一ID',
    `name` VARCHAR(200) NOT NULL COMMENT '考试名称',
    `school` VARCHAR(100) COMMENT '组织学校(冗余)',
    `grade` VARCHAR(50) COMMENT '年级(冗余)',
    `class_name` VARCHAR(50) COMMENT '班级(冗余)',
    `exam_date` DATE NOT NULL COMMENT '考试日期',
    `status` ENUM('待解析', '解析中', '已解析') DEFAULT '待解析' COMMENT '解析状态',
    `success_count` INT DEFAULT 0 COMMENT '解析成功人数',
    `fail_count` INT DEFAULT 0 COMMENT '解析失败人数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='考试基础信息表';

-- 6. 成绩与错题明细表 (兼容历史版本结构)
DROP TABLE IF EXISTS `exam_results`;
CREATE TABLE `exam_results` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    `exam_id` VARCHAR(50) NOT NULL COMMENT '关联考试ID',
    `student_no` VARCHAR(50) NOT NULL COMMENT '关联学号',
    `student_name` VARCHAR(50) COMMENT '学生姓名(冗余)',
    `school` VARCHAR(100) COMMENT '学校(冗余)',
    `grade` VARCHAR(50) COMMENT '年级(冗余)',
    `class_name` VARCHAR(50) COMMENT '班级(冗余)',
    `total_score` FLOAT NOT NULL COMMENT '总分',
    `question_scores` JSON COMMENT '各题得分数组(JSON格式)',
    `fail_reason` VARCHAR(255) COMMENT '如果解析失败的原因',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT `fk_result_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
    CONSTRAINT `fk_result_student` FOREIGN KEY (`student_no`) REFERENCES `students` (`student_no`)
) ENGINE=InnoDB COMMENT='成绩记录及试卷解析结果表';

-- ---------------------------------------------------------
-- 新版考试数据中心模块 (项目 -> 班级 -> 科目 -> 成绩明细)
-- ---------------------------------------------------------

-- 6.1 考试项目表
DROP TABLE IF EXISTS `exam_projects`;
CREATE TABLE `exam_projects` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '项目ID',
    `name` VARCHAR(200) NOT NULL COMMENT '考试项目名称',
    `exam_type` VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '考试类型: NORMAL-普通考试, JOINT-联合考试',
    `selected_school_ids` TEXT COMMENT '联合考试选中的学校ID列表(JSON)',
    `selected_class_ids` TEXT COMMENT '普通考试选中的班级ID列表(JSON)',
    `subject_names` TEXT COMMENT '项目科目列表(JSON)',
    `subject_benchmarks` TEXT COMMENT '学科基准分数配置',
    `school_count` INT DEFAULT 0 COMMENT '覆盖学校数',
    `class_count` INT DEFAULT 0 COMMENT '覆盖班级数',
    `student_count` INT DEFAULT 0 COMMENT '覆盖学生数',
    `subject_count` INT DEFAULT 0 COMMENT '科目数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='考试项目管理表';

-- 6.2 考试班级表
DROP TABLE IF EXISTS `exam_classes`;
CREATE TABLE `exam_classes` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '班级记录ID',
    `project_id` VARCHAR(50) NOT NULL COMMENT '关联考试项目ID',
    `school_id` VARCHAR(50) NOT NULL COMMENT '关联学校ID',
    `school` VARCHAR(100) NOT NULL COMMENT '学校名称',
    `grade` VARCHAR(50) NOT NULL COMMENT '年级',
    `class_name` VARCHAR(50) NOT NULL COMMENT '班级名称',
    `source_class_id` VARCHAR(50) COMMENT '关联全局班级ID',
    `student_count` INT DEFAULT 0 COMMENT '班级学生数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT `fk_class_project` FOREIGN KEY (`project_id`) REFERENCES `exam_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='考试班级管理表';

-- 6.3 考试科目表
DROP TABLE IF EXISTS `exam_subjects`;
CREATE TABLE `exam_subjects` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '科目记录ID',
    `class_id` VARCHAR(50) NOT NULL COMMENT '关联考试班级ID',
    `subject_name` VARCHAR(50) NOT NULL COMMENT '科目名称',
    `paper_url` VARCHAR(500) COMMENT '试卷文件地址',
    `answer_url` VARCHAR(500) COMMENT '答案文件地址',
    `score_uploaded` TINYINT(1) DEFAULT 0 COMMENT '是否已同步小题分成绩 (0-待同步, 1-已同步)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY `idx_exam_subject_class_name` (`class_id`, `subject_name`),
    CONSTRAINT `fk_subject_class` FOREIGN KEY (`class_id`) REFERENCES `exam_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='考试科目管理表';

-- 6.4 学生科目成绩与小题分表
DROP TABLE IF EXISTS `exam_student_scores`;
CREATE TABLE `exam_student_scores` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成绩记录ID',
    `subject_id` VARCHAR(50) NOT NULL COMMENT '关联考试科目ID',
    `student_no` VARCHAR(50) NOT NULL COMMENT '学生学号',
    `student_name` VARCHAR(50) COMMENT '学生姓名(冗余)',
    `answer_sheet_url` VARCHAR(500) COMMENT '学生试卷原卷路径',
    `score_entered` TINYINT(1) DEFAULT 0 COMMENT '成绩是否已录入 (0-未录入, 1-已录入)',
    `total_score` FLOAT NOT NULL COMMENT '科目总分',
    `question_scores` JSON COMMENT '各小题得分数组(JSON格式)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_exam_student_score_subject_student` (`subject_id`, `student_no`),
    CONSTRAINT `fk_score_subject` FOREIGN KEY (`subject_id`) REFERENCES `exam_subjects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_score_student` FOREIGN KEY (`student_no`) REFERENCES `students` (`student_no`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='学生科目成绩与小题分明细表';

-- ---------------------------------------------------------
-- 课程、资源与交互模块
-- ---------------------------------------------------------

-- 7. 课程资源表 (增加类型分类)
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '课程ID',
    `title` VARCHAR(200) NOT NULL COMMENT '课程标题',
    `cover` VARCHAR(255) COMMENT '封面图URL',
    `video_url` VARCHAR(500) COMMENT '视频URL',
    `content` TEXT COMMENT '课程详细富文本内容',
    `type` ENUM('general', 'sync', 'family', 'talk') DEFAULT 'general' COMMENT '课程类型: general-常规, sync-同步, family-家庭教育, talk-学霸说',
    `subject` VARCHAR(50) COMMENT '科目 (仅同步课程有效)',
    `grade` VARCHAR(50) COMMENT '年级 (仅同步课程有效)',
    `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
    `is_svip_only` TINYINT(1) DEFAULT 0 COMMENT '是否仅SVIP可见',
    `author` VARCHAR(100) DEFAULT NULL COMMENT '作者/讲师',
    `buy_count` INT DEFAULT 0 COMMENT '购买/学习人数',
    `episodes` INT DEFAULT 0 COMMENT '总节数',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-上架, 0-下架',
    `is_recommend` TINYINT(1) DEFAULT 0 COMMENT '是否今日推荐: 0-否, 1-是',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='课程与学习资源表';

-- 7.1 用户与课程交互表 (我的课程/最近查看)
DROP TABLE IF EXISTS `user_courses`;
CREATE TABLE `user_courses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_uid` BIGINT NOT NULL COMMENT '用户UID',
    `course_id` VARCHAR(50) NOT NULL COMMENT '课程ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_course` (`user_uid`, `course_id`)
) ENGINE=InnoDB COMMENT='我的课程表 (点击进入算我的课程)';

-- 7.2 用户收藏表 (我的收藏)
DROP TABLE IF EXISTS `user_collections`;
CREATE TABLE `user_collections` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_uid` BIGINT NOT NULL COMMENT '用户UID',
    `course_id` VARCHAR(50) NOT NULL COMMENT '课程ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_collection` (`user_uid`, `course_id`)
) ENGINE=InnoDB COMMENT='用户收藏表';

-- 7.3 用户学习记录表 (学习记录)
DROP TABLE IF EXISTS `user_study_records`;
CREATE TABLE `user_study_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_uid` BIGINT NOT NULL COMMENT '用户UID',
    `course_id` VARCHAR(50) NOT NULL COMMENT '课程ID',
    `progress` INT DEFAULT 0 COMMENT '学习进度百分比',
    `last_study_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_record` (`user_uid`, `course_id`)
) ENGINE=InnoDB COMMENT='学习记录表 (点击立即学习算学习记录)';

-- 8. AI 自习室报名表
DROP TABLE IF EXISTS `study_room_enrollments`;
CREATE TABLE `study_room_enrollments` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '报名记录ID',
    `parent_name` VARCHAR(50) NOT NULL COMMENT '家长姓名',
    `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
    `status` ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending' COMMENT '状态',
    `remark` VARCHAR(255) COMMENT '家长备注/拒绝原因',
    `apply_time` DATETIME NOT NULL COMMENT '报名时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='AI自习室预约报名表';

-- 9. FAQ 分类表
DROP TABLE IF EXISTS `faq_categories`;
CREATE TABLE `faq_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='FAQ 分类表';

-- 10. 常见问题 FAQ 表
DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT 'FAQ ID',
    `category_name` VARCHAR(50) DEFAULT '其他' COMMENT '所属模块名称',
    `category_id` INT COMMENT '分类ID',
    `question` VARCHAR(255) NOT NULL COMMENT '问题标题',
    `answer` TEXT NOT NULL COMMENT '问题解答',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='客服支持常见问题表';

-- 11. 微信群配置表
DROP TABLE IF EXISTS `wechat_configs`;
CREATE TABLE `wechat_configs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
    `group_name` VARCHAR(100) NOT NULL COMMENT '群名称',
    `qr_code_path` VARCHAR(255) NOT NULL COMMENT '二维码图片相对路径',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='官方微信群二维码配置表';

-- ---------------------------------------------------------
-- 订单与交易模块
-- ---------------------------------------------------------

-- 11.1 纸张单价配置表
DROP TABLE IF EXISTS `paper_prices`;
CREATE TABLE `paper_prices` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(20) NOT NULL COMMENT '纸张规格: A4, A3',
    `side` VARCHAR(20) NOT NULL COMMENT '单/双面: 单面, 双面',
    `color` VARCHAR(20) NOT NULL COMMENT '颜色: 黑白, 彩色',
    `price` DECIMAL(10,2) NOT NULL COMMENT '单价(元/张)',
    `min_quantity` INT DEFAULT 1 COMMENT '起印数量',
    `unit` VARCHAR(10) DEFAULT '张' COMMENT '单位'
) ENGINE=InnoDB COMMENT='纸张打印单价配置表';

-- 11.2 配送费用配置表
DROP TABLE IF EXISTS `delivery_configs`;
CREATE TABLE `delivery_configs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '配送方式: 标准快递, 极速达, 自提',
    `price` DECIMAL(10,2) NOT NULL COMMENT '基础运费',
    `free_limit` DECIMAL(10,2) DEFAULT 0.00 COMMENT '免运费额度',
    `description` VARCHAR(200) COMMENT '描述说明'
) ENGINE=InnoDB COMMENT='配送费用配置表';

-- 初始化打印配置数据
INSERT INTO `paper_prices` (`type`, `side`, `color`, `price`) VALUES 
('A4', '单面', '黑白', 0.50),
('A4', '双面', '黑白', 0.80),
('A4', '单面', '彩色', 2.00),
('A4', '双面', '彩色', 3.50),
('A3', '单面', '黑白', 1.00),
('A3', '双面', '黑白', 1.50);

INSERT INTO `delivery_configs` (`name`, `price`, `free_limit`, `description`) VALUES 
('标准快递', 10.00, 50.00, '预计2-3天送达'),
('极速达', 20.00, 100.00, '同城当日或次日送达'),
('自提', 0.00, 0.00, '线下门店自提，无需运费');

-- 12. 错题打印订单表
DROP TABLE IF EXISTS `print_orders`;
CREATE TABLE `print_orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内部记录ID',
    `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '外部订单编号(POD开头)',
    `user_name` VARCHAR(50) NOT NULL COMMENT '下单用户姓名(冗余)',
    `user_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
    `document_name` VARCHAR(200) NOT NULL COMMENT '打印文件名称',
    `pages` INT NOT NULL COMMENT '总页数',
    `print_type` VARCHAR(50) NOT NULL COMMENT '打印类型: 黑白单面/彩色双面等',
    `delivery_method` VARCHAR(50) NOT NULL COMMENT '配送方式: 标准快递/自提等',
    `total_price` DECIMAL(10,2) NOT NULL COMMENT '订单总价',
    `order_status` TINYINT DEFAULT 1 COMMENT '状态: 1-待支付, 2-待打印, 3-待配送, 4-已完成, 0-已取消',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='错题本纸质打印订单表';

-- 13. VIP套餐订单表
DROP TABLE IF EXISTS `vip_orders`;
CREATE TABLE `vip_orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内部记录ID',
    `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '外部订单编号(VOD开头)',
    `user_uid` BIGINT NOT NULL COMMENT '购买用户唯一ID(关联 sys_accounts.uid)',
    `user_name` VARCHAR(50) NOT NULL COMMENT '购买用户姓名(冗余)',
    `user_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
    `package_type` VARCHAR(50) NOT NULL COMMENT '套餐类型(VIP基础版/SVIP专业版)',
    `period` VARCHAR(50) NOT NULL COMMENT '时长(月包/季包/年包)',
    `price` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    `payment_status` TINYINT DEFAULT 0 COMMENT '支付状态: 0-待支付, 1-已支付, 2-已退款',
    `payment_method` VARCHAR(50) COMMENT '支付方式(微信/支付宝)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='VIP/SVIP购买订单表';

-- ---------------------------------------------------------
-- 系统监控日志模块
-- ---------------------------------------------------------

-- 14. 系统操作日志表
DROP TABLE IF EXISTS `sys_logs`;
CREATE TABLE `sys_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    `uid` BIGINT COMMENT '操作用户唯一标识(关联 sys_accounts.uid)',
    `user_name` VARCHAR(50) COMMENT '操作账号',
    `nick_name` VARCHAR(50) COMMENT '操作人昵称(冗余)',
    `operation` VARCHAR(255) COMMENT '操作动作描述(如: 登录系统, 导出考试数据)',
    `method` VARCHAR(10) COMMENT '请求方法(GET/POST/PUT/DELETE)',
    `url` VARCHAR(255) COMMENT '请求接口路径',
    `ip` VARCHAR(50) COMMENT '操作来源IP',
    `location` VARCHAR(100) COMMENT 'IP归属地解析(冗余)',
    `status` INT COMMENT 'HTTP响应状态码(如200, 500)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间'
) ENGINE=InnoDB COMMENT='系统操作行为审计日志表';

-- ---------------------------------------------------------
-- 插入模拟数据 (Mock Data)
-- ---------------------------------------------------------

-- 0. 新版考试项目与班级示例数据
INSERT INTO `exam_projects` (`id`, `name`, `create_time`, `update_time`) VALUES
('EP1700000000001', '2023-2024学年第一学期期中联考', '2023-11-01 10:00:00', '2023-11-01 10:00:00'),
('EP1700000000002', '2024年春季学期摸底考试', '2024-03-01 09:00:00', '2024-03-01 09:00:00');

-- 修复后的 exam_classes 插入语句
INSERT INTO `exam_classes` (`id`, `project_id`, `school_id`, `school`, `grade`, `class_name`, `create_time`, `update_time`) VALUES
('EC1700000000001', 'EP1700000000001', 'SCH001', '第一中学', '高一', '1班', '2023-11-01 10:30:00', '2023-11-01 10:30:00'),
('EC1700000000002', 'EP1700000000001', 'SCH001', '第一中学', '高一', '2班', '2023-11-01 10:35:00', '2023-11-01 10:35:00'),
('EC1700000000003', 'EP1700000000001', 'SCH011', '第二中学', '高一', '1班', '2023-11-01 10:40:00', '2023-11-01 10:40:00'),
('EC1700000000004', 'EP1700000000002', 'SCH012', '实验中学', '初三', '强化班', '2024-03-01 09:30:00', '2024-03-01 09:30:00');
-- 1. 系统角色表数据
INSERT INTO `sys_roles` (`id`, `role_name`, `role_code`, `description`, `status`) VALUES
(1, '超级管理员', 'super_admin', '系统最高权限', 1),
(2, '后台管理', 'admin', '日常后台运营管理', 1),
(3, '家长', 'parent', '小程序端家长用户', 1);

-- 2. 统一账号表数据 (密码默认设为123456)
INSERT INTO `sys_accounts` (`uid`, `username`, `nickname`, `avatar`, `password`, `phone`, `email`, `role_id`, `is_vip`, `is_svip`, `online_status`, `is_bound_student`, `is_enabled`) VALUES
(1, 'admin', '超级管理员', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000000', 'admin@example.com', 1, NULL, NULL, 'offline', 0, 1),
(2, 'manager', '运营人员', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000001', 'manager@example.com', 2, NULL, NULL, 'offline', 0, 1),
(3, 'parent01', '张三爸爸', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000002', 'parent01@example.com', 3, 1, 0, 'offline', 1, 1),
(4, 'parent02', '李四妈妈', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000003', 'parent02@example.com', 3, 0, 0, 'offline', 1, 1),
(5, 'parent03', '王五妈妈', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000004', 'parent03@example.com', 3, 1, 1, 'offline', 1, 1),
(6, 'parent04', '赵六爸爸', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000005', 'parent04@example.com', 3, 0, 0, 'offline', 1, 1),
(7, 'manager02', '财务人员', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000006', 'finance@example.com', 2, NULL, NULL, 'offline', 0, 1),
(8, 'parent05', '孙七妈妈', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000007', 'parent05@example.com', 3, 1, 0, 'offline', 1, 1),
(9, 'parent06', '周八爸爸', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000008', 'parent06@example.com', 3, 0, 0, 'offline', 1, 1),
(10, 'parent07', '吴九妈妈', 'https://img.yzcdn.cn/vant/cat.jpeg', '123456', '13800000009', 'parent07@example.com', 3, 1, 1, 'offline', 1, 1);

-- 3. 学校结构表数据
INSERT INTO `schools` (`school_id`, `province`, `city`, `name`, `type`, `status`) VALUES
('SCH001', '广东省', '广州市', '第一中学', 'school', 1),
('SCH002', '广东省', '深圳市', '实验小学', 'school', 1),
('SCH003', '广东省', '东莞市', '育才中学', 'school', 1),
('SCH004', '浙江省', '杭州市', '杭州高级中学', 'school', 1),
('SCH005', '江苏省', '南京市', '南京外国语学校', 'school', 1),
('SCH006', '北京市', '北京市', '北京四中', 'school', 1),
('SCH007', '上海市', '上海市', '上海建平中学', 'school', 1),
('SCH008', '湖北省', '武汉市', '武汉外国语学校', 'school', 1),
('SCH009', '四川省', '成都市', '成都七中', 'school', 1),
('SCH010', '广东省', '广州市', '执信中学', 'school', 1);

-- 3.1 全局班级表数据
INSERT INTO `sys_classes` (`classid`, `school_id`, `grade`, `alias`) VALUES
('CLS001', 'SCH001', '初一', '1班'),
('CLS002', 'SCH002', '六年级', '2班'),
('CLS003', 'SCH003', '高一', '3班'),
('CLS004', 'SCH004', '高二', '理科班'),
('CLS005', 'SCH005', '初三', '英语强化班'),
('CLS006', 'SCH006', '初一', '2班'),
('CLS007', 'SCH007', '高一', '1班'),
('CLS008', 'SCH008', '初二', '3班'),
('CLS009', 'SCH001', '初三', '1班'),
('CLS010', 'SCH002', '四年级', '1班');

-- 4. 学生档案表数据
INSERT INTO `students` (`id`, `student_no`, `name`, `school_id`, `class_id`, `school`, `grade`, `class_name`, `bound_count`) VALUES
('STU001', '20230001', '张三', 'SCH001', 'CLS001', '第一中学', '初一', '1班', 2),
('STU002', '20230002', '李四', 'SCH002', 'CLS002', '实验小学', '六年级', '2班', 1),
('STU003', '20230003', '王五', 'SCH003', 'CLS003', '育才中学', '高一', '3班', 1),
('STU004', '20230004', '赵六', 'SCH004', 'CLS004', '杭州高级中学', '高二', '理科班', 1),
('STU005', '20230005', '孙七', 'SCH005', 'CLS005', '南京外国语学校', '初三', '英语强化班', 1),
('STU006', '20230006', '周八', 'SCH006', 'CLS006', '北京四中', '初一', '2班', 1),
('STU007', '20230007', '吴九', 'SCH007', 'CLS007', '上海建平中学', '高一', '1班', 1),
('STU008', '20230008', '郑十', 'SCH008', 'CLS008', '武汉外国语学校', '初二', '3班', 0),
('STU009', '20230009', '张小三', 'SCH001', 'CLS009', '第一中学', '初三', '1班', 1),
('STU010', '20230010', '李小四', 'SCH002', 'CLS010', '实验小学', '四年级', '1班', 1);

-- 4.1 学生-家长绑定表数据 (体现新规则：一个家长账号只能绑定一个学生，但一个学生可以被多个家长绑定)
INSERT INTO `student_parent_bindings` (`student_id`, `parent_uid`, `binding_type`) VALUES
('STU001', 3, 'parent'), -- 张三爸爸绑定张三
('STU001', 4, 'parent'), -- 李四妈妈绑定张三 (共同监护)
('STU009', 5, 'parent'), -- 王五妈妈绑定张小三
('STU002', 6, 'parent'), -- 赵六爸爸绑定李四
('STU003', 8, 'parent'), -- 孙七妈妈绑定王五
('STU004', 9, 'parent'), -- 周八爸爸绑定赵六
('STU005', 10, 'parent'); -- 吴九妈妈绑定孙七

-- 5. 考试信息与成绩表数据
INSERT INTO `exams` (`id`, `name`, `school`, `grade`, `class_name`, `exam_date`, `status`, `success_count`, `fail_count`) VALUES
('EXAM001', '2023-2024学年第一学期期中考试', '第一中学', '初一', '1班', '2023-11-10', '已解析', 45, 0),
('EXAM002', '2023-2024学年第一学期期末考试', '实验小学', '六年级', '2班', '2024-01-15', '已解析', 40, 2),
('EXAM003', '2024年春季月考一', '育才中学', '高一', '3班', '2024-03-20', '解析中', 0, 0),
('EXAM004', '2024年中考一模', '第一中学', '初三', '全级', '2024-04-10', '待解析', 0, 0),
('EXAM005', '2024年春季月考二', '北京四中', '初一', '2班', '2024-04-15', '已解析', 50, 0);

-- 6. 成绩与错题明细表数据
INSERT INTO `exam_results` (`exam_id`, `student_no`, `student_name`, `school`, `grade`, `class_name`, `total_score`, `question_scores`) VALUES
('EXAM001', '20230001', '张三', '第一中学', '初一', '1班', 95.5, '{"q1": 5, "q2": 10, "q3": 0}'),
('EXAM002', '20230002', '李四', '实验小学', '六年级', '2班', 88.0, '{"q1": 5, "q2": 5, "q3": 5}'),
('EXAM001', '20230005', '孙七', '南京外国语学校', '初三', '英语强化班', 76.5, '{"q1": 5, "q2": 0, "q3": 5}'),
('EXAM002', '20230004', '赵六', '杭州高级中学', '高二', '理科班', 92.0, '{"q1": 10, "q2": 10, "q3": 5}'),
('EXAM005', '20230006', '周八', '北京四中', '初一', '2班', 98.0, '{"q1": 10, "q2": 10, "q3": 10}'),
('EXAM001', '20230009', '张小三', '第一中学', '初三', '1班', 85.0, '{"q1": 5, "q2": 5, "q3": 5}');

-- 7. 课程资源表数据
INSERT INTO `courses` (`id`, `title`, `cover`, `video_url`, `content`, `type`, `subject`, `grade`, `status`, `price`, `is_svip_only`, `author`, `buy_count`, `episodes`, `is_recommend`) VALUES
('CRS001', '初中数学基础巩固', 'https://example.com/cover1.jpg', 'https://example.com/video1.mp4', '<p>这是初中数学基础巩固课程的详细介绍...</p>', 'general', NULL, NULL, 1, 0.00, 0, '教研组', 1200, 24, 1),
('CRS002', '中考物理冲刺班', 'https://example.com/cover2.jpg', 'https://example.com/video2.mp4', '<p>这是中考物理冲刺冲刺班的详细介绍...</p>', 'general', NULL, NULL, 1, 99.00, 1, '张老师', 850, 12, 1),
('CRS003', '小学英语启蒙课', 'https://example.com/cover3.jpg', 'https://example.com/video3.mp4', '<p>英语启蒙...</p>', 'general', NULL, NULL, 1, 0.00, 0, 'Emma', 3000, 30, 0),
('CRS004', '高中化学难点解析', 'https://example.com/cover4.jpg', 'https://example.com/video4.mp4', '<p>化学难点...</p>', 'general', NULL, NULL, 1, 199.00, 1, '李博士', 420, 15, 0),
('CRS005', '初中生物实验视频', 'https://example.com/cover5.jpg', 'https://example.com/video5.mp4', '<p>生物实验...</p>', 'general', NULL, NULL, 1, 0.00, 0, '王老师', 1500, 10, 0),
('CRS006', '公益课程：趣味数学', 'https://example.com/cover6.jpg', 'https://example.com/video6.mp4', '<p>趣味数学公益讲座...</p>', 'general', '数学', '全级', 1, 0.00, 0, '陈教授', 5000, 1, 0),
('CRS007', '公益课程：文学鉴赏', 'https://example.com/cover7.jpg', 'https://example.com/video7.mp4', '<p>经典文学名著鉴赏公益课...</p>', 'general', '语文', '全级', 1, 0.00, 0, '林博士', 2800, 5, 0),
('SYNC001', '七年级上册数学同步', 'https://example.com/sync1.jpg', 'https://example.com/video3.mp4', '<p>七年级数学同步讲解...</p>', 'sync', '数学', '七年级', 1, 0.00, 0, '张老师', 12000, 48, 1),
('SYNC002', '八年级下册物理同步', 'https://example.com/sync2.jpg', 'https://example.com/video_sync2.mp4', '<p>八年级物理同步辅导...</p>', 'sync', '物理', '八年级', 1, 0.00, 0, '王老师', 8000, 36, 0),
('SYNC003', '九年级英语中考总复习', 'https://example.com/sync3.jpg', 'https://example.com/video_sync3.mp4', '<p>中考英语重点难点突破...</p>', 'sync', '英语', '九年级', 1, 0.00, 0, 'Sarah', 15000, 60, 0),
('SYNC004', '小学五年级语文同步', 'https://example.com/sync4.jpg', 'https://example.com/video_sync4.mp4', '<p>小学语文阅读与写作...</p>', 'sync', '语文', '五年级', 1, 0.00, 0, '林老师', 5000, 40, 0),
('SYNC005', '高一数学必修一精品课', 'https://example.com/sync5.jpg', 'https://example.com/video_sync5.mp4', '<p>高中数学衔接与提高...</p>', 'sync', '数学', '高一', 1, 0.00, 0, '陈教授', 9000, 52, 0),
('FAM001', '如何与青春期孩子沟通', 'https://example.com/fam1.jpg', 'https://example.com/video4.mp4', '<p>家庭教育讲座...</p>', 'family', NULL, NULL, 1, 0.00, 0, '心连心工作室', 6000, 8, 1),
('FAM002', '考前家长心理疏导指南', 'https://example.com/fam2.jpg', 'https://example.com/video_fam2.mp4', '<p>如何陪伴孩子度过备考期...</p>', 'family', NULL, NULL, 1, 0.00, 0, '心理专家李老师', 4500, 5, 0),
('FAM003', '小学生行为习惯养成方案', 'https://example.com/fam3.jpg', 'https://example.com/video_fam3.mp4', '<p>从小培养良好的学习习惯...</p>', 'family', NULL, NULL, 1, 0.00, 0, '资深教育者张老师', 3200, 12, 0),
('SVIP001', 'SVIP 特权课程：奥数思维突破', 'https://example.com/svip1.jpg', 'https://example.com/video_svip1.mp4', '<p>高级奥数解题技巧...</p>', 'general', '数学', '初中', 1, 0.00, 1, '金牌教练', 150, 20, 0),
('SVIP002', 'SVIP 特权课程：英语口语大师课', 'https://example.com/svip2.jpg', 'https://example.com/video_svip2.mp4', '<p>外教母语级口语训练...</p>', 'general', '英语', '全级', 1, 0.00, 1, 'Steven', 300, 10, 0),
('SVIP003', 'SVIP 特权课程：物理竞赛培优', 'https://example.com/svip3.jpg', 'https://example.com/video_svip3.mp4', '<p>全国物理竞赛重难点解析...</p>', 'general', '物理', '高中', 1, 0.00, 1, '物理特级教师', 100, 15, 0),
('SVIP004', 'SVIP 特权课程：考研数学提分营', 'https://example.com/svip4.jpg', 'https://example.com/video_svip4.mp4', '<p>考研数学核心考点串讲...</p>', 'general', '数学', '考研', 1, 0.00, 1, '数学名师', 80, 45, 0),
('TALK001', '清华学霸分享：我的高效学习法', 'https://example.com/talk1.jpg', 'https://example.com/video_talk1.mp4', '<p>如何制定计划，如何保持专注...</p>', 'talk', NULL, NULL, 1, 0.00, 0, '张学霸', 15000, 1, 1),
('TALK002', '北大才女谈：语文阅读理解提分秘籍', 'https://example.com/talk2.jpg', 'https://example.com/video_talk2.mp4', '<p>阅读理解不丢分的技巧分享...</p>', 'talk', NULL, NULL, 1, 9.90, 0, '李学霸', 8000, 3, 0),
('TALK003', '中考状元：物理考前冲刺心态调节', 'https://example.com/talk3.jpg', 'https://example.com/video_talk3.mp4', '<p>考前如何调整心态，发挥超常...</p>', 'talk', NULL, NULL, 1, 0.00, 1, '王学霸', 5000, 1, 0),
('TALK004', '学霸笔记展示：数学错题本怎么做', 'https://example.com/talk4.jpg', 'https://example.com/video_talk4.mp4', '<p>手把手教你整理最高效的错题本...</p>', 'talk', NULL, NULL, 1, 0.00, 0, '刘学霸', 12000, 2, 0),
('TALK005', '英语大神：如何在一个月内词汇量翻倍', 'https://example.com/talk5.jpg', 'https://example.com/video_talk5.mp4', '<p>科学背单词法，告别死记硬背...</p>', 'talk', NULL, NULL, 1, 19.90, 0, '陈学霸', 6500, 5, 0),
('TALK006', '浙大学霸：理综解题套路大公开', 'https://example.com/talk6.jpg', 'https://example.com/video_talk6.mp4', '<p>物理化学生物联动的解题思路...</p>', 'talk', NULL, NULL, 1, 0.00, 1, '赵学霸', 4000, 10, 0);

-- 8. AI 自习室报名表数据
INSERT INTO `study_room_enrollments` (`id`, `parent_name`, `student_name`, `phone`, `status`, `apply_time`) VALUES
('ENR001', '张三爸爸', '张三', '13800000002', 'confirmed', '2023-10-01 10:00:00'),
('ENR002', '王五妈妈', '王小五', '13800000004', 'pending', '2023-10-02 11:30:00'),
('ENR003', '赵六爸爸', '赵小六', '13800000005', 'rejected', '2023-10-03 09:15:00'),
('ENR004', '吴九妈妈', '吴九', '13800000009', 'confirmed', '2024-04-01 14:00:00');

-- 9. FAQ 分类表数据
INSERT INTO `faq_categories` (`id`, `name`, `sort`, `status`) VALUES
(1, '注册绑定', 1, 1),
(2, '成绩查询', 2, 1),
(3, 'VIP服务', 3, 1),
(4, '课程报名', 4, 1),
(5, '技术支持', 5, 1);

-- 10. 常见问题 FAQ 表数据
INSERT INTO `faqs` (`id`, `category_name`, `category_id`, `question`, `answer`, `status`) VALUES
('FAQ001', '注册绑定', 1, '如何绑定学生？', '在小程序“我的”页面，点击“绑定学生”，输入学号和姓名即可完成绑定。', 1),
('FAQ002', '成绩查询', 2, '错题本怎么打印？', '进入错题本页面，选择需要打印的题目，点击“生成打印PDF”，然后可以选择云打印服务。', 1),
('FAQ003', 'VIP服务', 3, 'VIP和SVIP有什么区别？', 'VIP可查看详细成绩分析与基础错题本；SVIP享有额外特权，包括AI专属课程、智能自习室以及个性化学习计划生成。', 1),
('FAQ004', '账号问题', 1, '忘记密码怎么办？', '在登录页面点击“忘记密码”，通过绑定的手机号验证后即可重置。', 1),
('FAQ005', '技术支持', 5, 'APP闪退怎么办？', '请尝试清理缓存或更新到最新版本。如果问题依旧，请联系客服。', 1);

-- 11. 微信群配置表数据
ALTER TABLE `wechat_configs` ADD COLUMN `display_location` VARCHAR(50) DEFAULT 'NONE' COMMENT '展示位置: HOME_BANNER, HELP_SERVICE, NONE';

INSERT INTO `wechat_configs` (`group_name`, `qr_code_path`, `status`, `display_location`) VALUES
('官方家长交流1群', '/uploads/qrcode1.png', 1, 'HOME_BANNER'),
('初一学习辅导群', '/uploads/qrcode2.png', 1, 'HELP_SERVICE'),
('北京家长备考群', '/uploads/qrcode3.png', 1, 'NONE');

-- 12. 错题打印订单表数据
INSERT INTO `print_orders` (`order_no`, `user_name`, `user_phone`, `document_name`, `pages`, `print_type`, `delivery_method`, `total_price`, `order_status`) VALUES
('POD202310010001', '张三爸爸', '13800000002', '张三数学错题本_10月', 15, '黑白双面', '快递配送', 12.50, 4),
('POD202310050002', '李四妈妈', '13800000003', '李四英语复习资料', 30, '彩色单面', '门店自提', 45.00, 1),
('POD202311020003', '王五妈妈', '13800000004', '王五物理错题集', 10, '黑白单面', '快递配送', 8.00, 2),
('POD202404010004', '吴九妈妈', '13800000009', '吴九化学重点', 20, '彩色双面', '标准快递', 30.00, 1);

-- 13. VIP套餐订单表数据
INSERT INTO `vip_orders` (`order_no`, `user_uid`, `user_name`, `user_phone`, `package_type`, `period`, `price`, `payment_status`, `payment_method`) VALUES
('VOD202309010001', 3, '张三爸爸', '13800000002', 'SVIP专业版', '年包', 365.00, 1, '微信支付'),
('VOD202309150002', 4, '李四妈妈', '13800000003', 'VIP基础版', '季包', 99.00, 1, '支付宝'),
('VOD202310010003', 5, '王五妈妈', '13800000004', 'SVIP专业版', '月包', 39.00, 1, '微信支付'),
('VOD202404010004', 10, '吴九妈妈', '13800000009', 'SVIP专业版', '年包', 365.00, 1, '微信支付');

-- 14. 系统操作日志表数据
INSERT INTO `sys_logs` (`uid`, `user_name`, `nick_name`, `operation`, `method`, `url`, `ip`, `location`, `status`) VALUES
(1, 'admin', '超级管理员', '登录系统', 'POST', '/api/auth/login/password', '192.168.1.100', '局域网', 200),
(2, 'manager', '运营人员', '查询学生列表', 'GET', '/api/students/list', '192.168.1.101', '局域网', 200),
(1, 'admin', '超级管理员', '新增学校', 'POST', '/api/school/add', '192.168.1.100', '局域网', 200),
(3, 'parent01', '张三爸爸', '查看错题', 'GET', '/api/exams/mistakes', '10.0.0.1', '外网', 200),
(10, 'parent07', '吴九妈妈', '报名自习室', 'POST', '/api/study-room/enroll', '172.16.0.1', '外网', 200);

SET FOREIGN_KEY_CHECKS = 1;

-- 11. 试卷科目表
CREATE TABLE IF NOT EXISTS `paper_subjects` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `icon` VARCHAR(50),
    `color` VARCHAR(20),
    `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. 试卷数据表
CREATE TABLE IF NOT EXISTS `exam_papers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `subject` VARCHAR(50),
    `grade` VARCHAR(50),
    `year` VARCHAR(10),
    `type` VARCHAR(20),
    `tags` VARCHAR(200),
    `download_count` INT DEFAULT 0,
    `file_path` VARCHAR(500),
    `is_recommend` BIT(1) DEFAULT b'0',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. 初始化科目数据
INSERT IGNORE INTO `paper_subjects` (`name`, `icon`, `color`, `sort_order`) VALUES
('语文', 'read', '#ff5252', 1),
('数学', 'chart', '#4caf50', 2),
('英语', 'edit', '#2196f3', 3),
('物理', 'setting', '#00bcd4', 4),
('化学', 'filter', '#ff9800', 5),
('生物', 'share', '#3f51b5', 6),
('历史', 'clock', '#795548', 7),
('政治', 'notification', '#e91e63', 8),
('地理', 'location', '#009688', 9);

-- 15. 课程购买订单表
CREATE TABLE IF NOT EXISTS `course_orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_no` VARCHAR(50) NOT NULL UNIQUE,
    `user_uid` BIGINT NOT NULL,
    `course_id` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `payment_status` INT DEFAULT 0, -- 0-待支付, 1-已支付
    `payment_method` VARCHAR(50),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_course` (`user_uid`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. 初始化试卷数据
INSERT IGNORE INTO `exam_papers` (`title`, `subject`, `grade`, `year`, `type`, `tags`, `download_count`, `is_recommend`, `file_path`) VALUES
('2023年杭州二中高三仿真模拟卷 (一)', '数学', '高三', '2023', 'FAMOUS', '名校,重点,综合,PDF', 1250, 1, '/uploads/papers/demo.pdf'),
('2024年北京人大附中初三二模真题', '语文', '初三', '2024', 'FAMOUS', '真题,必刷,全科,解析', 3400, 0, '/uploads/papers/demo.pdf'),
('上海中学2023-2024学年高一期末考试卷', '数学', '高一', '2024', 'FAMOUS', '名校,期末,数学,精品', 890, 1, '/uploads/papers/demo.pdf'),
('2023年西安西工大附中初一入学摸底测试', '语文', '初一', '2023', 'FAMOUS', '摸底,语文,PDF版', 2100, 0, '/uploads/papers/demo.pdf'),
('2024年成都七中高二联考物理压轴卷', '物理', '高二', '2024', 'JOINT', '联考,名校,物理,解析', 1560, 1, '/uploads/papers/demo.pdf');
