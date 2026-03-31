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
    `password` VARCHAR(255) COMMENT '加密后的登录密码',
    `phone` VARCHAR(20) UNIQUE COMMENT '绑定手机号',
    `email` VARCHAR(100) UNIQUE COMMENT '绑定邮箱',
    `wxid` VARCHAR(100) UNIQUE COMMENT '微信 OpenID/UnionID',
    `qqid` VARCHAR(100) UNIQUE COMMENT 'QQ OpenID',
    `role_id` INT NOT NULL COMMENT '关联角色ID',
    `is_vip` TINYINT DEFAULT NULL COMMENT '是否VIP: 1-是, 0-否 (仅家长角色有效)',
    `is_svip` TINYINT DEFAULT NULL COMMENT '是否SVIP: 1-是, 0-否 (仅家长角色有效)',
    `online_status` ENUM('online', 'offline', 'banned') DEFAULT 'offline' COMMENT '在线状态: online-在线, offline-离线, banned-封禁',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用: 1-启用, 0-禁用',
    `last_login_time` DATETIME COMMENT '最后登录时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建日期',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT `fk_account_role` FOREIGN KEY (`role_id`) REFERENCES `sys_roles` (`id`)
) ENGINE=InnoDB COMMENT='系统统一账号表';


-- ---------------------------------------------------------
-- 核心业务模块
-- ---------------------------------------------------------

-- 3. 学校结构表 (冗余设计)
DROP TABLE IF EXISTS `schools`;
CREATE TABLE `schools` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '学校唯一标识',
    `name` VARCHAR(100) NOT NULL COMMENT '学校名称',
    `type` VARCHAR(20) DEFAULT 'school' COMMENT '节点类型',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='学校基础信息表';

-- 4. 学生档案表 (包含状态和会员冗余)
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '学生唯一ID',
    `student_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
    `name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
    `gender` ENUM('男', '女', '未知') DEFAULT '未知' COMMENT '性别',
    `school` VARCHAR(100) COMMENT '所在学校(冗余)',
    `grade` VARCHAR(50) COMMENT '所在年级(冗余)',
    `class_name` VARCHAR(50) COMMENT '所在班级(冗余)',
    `parent_phone` VARCHAR(20) COMMENT '家长联系电话',
    `is_bound` BOOLEAN DEFAULT FALSE COMMENT '是否已绑定家长',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='学生档案表';

-- 5. 考试信息与成绩表
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

-- 6. 成绩与错题明细表 (包含题目得分冗余数组)
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
-- 课程、资源与交互模块
-- ---------------------------------------------------------

-- 7. 课程资源表
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '课程ID',
    `title` VARCHAR(200) NOT NULL COMMENT '课程标题',
    `cover` VARCHAR(255) COMMENT '封面图URL',
    `video_url` VARCHAR(500) COMMENT '视频URL',
    `content` TEXT COMMENT '课程详细富文本内容',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-上架, 0-下架',
    `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格(可选)',
    `is_svip_only` BOOLEAN DEFAULT FALSE COMMENT '是否SVIP专属',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='课程与学习资源表';

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

-- 1. 系统角色表数据
INSERT INTO `sys_roles` (`id`, `role_name`, `role_code`, `description`, `status`) VALUES
(1, '超级管理员', 'super_admin', '系统最高权限', 1),
(2, '后台管理', 'admin', '日常后台运营管理', 1),
(3, '家长', 'parent', '小程序端家长用户', 1);

-- 2. 统一账号表数据 (密码默认设为123456)
INSERT INTO `sys_accounts` (`uid`, `username`, `nickname`, `password`, `phone`, `email`, `role_id`, `is_vip`, `is_svip`, `online_status`, `is_enabled`) VALUES
(1, 'admin', '超级管理员', '123456', '13800000000', 'admin@example.com', 1, NULL, NULL, 'offline', 1),
(2, 'manager', '运营人员', '123456', '13800000001', 'manager@example.com', 2, NULL, NULL, 'offline', 1),
(3, 'parent01', '张三爸爸', '123456', '13800000002', 'parent01@example.com', 3, 1, 0, 'offline', 1),
(4, 'parent02', '李四妈妈', '123456', '13800000003', 'parent02@example.com', 3, 0, 0, 'offline', 1);

-- 3. 学校结构表数据
INSERT INTO `schools` (`id`, `name`, `type`, `status`) VALUES
('SCH001', '第一中学', 'school', 1),
('SCH002', '实验小学', 'school', 1);

-- 4. 学生档案表数据
INSERT INTO `students` (`id`, `student_no`, `name`, `gender`, `school`, `grade`, `class_name`, `parent_phone`, `is_bound`) VALUES
('STU001', '20230001', '张三', '男', '第一中学', '初一', '1班', '13800000002', 1),
('STU002', '20230002', '李四', '女', '实验小学', '六年级', '2班', '13800000003', 0);

-- 5. 考试信息与成绩表数据
INSERT INTO `exams` (`id`, `name`, `school`, `grade`, `class_name`, `exam_date`, `status`, `success_count`, `fail_count`) VALUES
('EXAM001', '2023-2024学年第一学期期中考试', '第一中学', '初一', '1班', '2023-11-10', '已解析', 45, 0),
('EXAM002', '2023-2024学年第一学期期末考试', '实验小学', '六年级', '2班', '2024-01-15', '已解析', 40, 2);

-- 6. 成绩与错题明细表数据
INSERT INTO `exam_results` (`exam_id`, `student_no`, `student_name`, `school`, `grade`, `class_name`, `total_score`, `question_scores`) VALUES
('EXAM001', '20230001', '张三', '第一中学', '初一', '1班', 95.5, '{"q1": 5, "q2": 10, "q3": 0}'),
('EXAM002', '20230002', '李四', '实验小学', '六年级', '2班', 88.0, '{"q1": 5, "q2": 5, "q3": 5}');

-- 7. 课程资源表数据
INSERT INTO `courses` (`id`, `title`, `cover`, `video_url`, `content`, `status`, `price`, `is_svip_only`) VALUES
('CRS001', '初中数学基础巩固', 'https://example.com/cover1.jpg', 'https://example.com/video1.mp4', '<p>这是初中数学基础巩固课程的详细介绍...</p>', 1, 0.00, 0),
('CRS002', '中考物理冲刺冲刺班', 'https://example.com/cover2.jpg', 'https://example.com/video2.mp4', '<p>这是中考物理冲刺冲刺班的详细介绍...</p>', 1, 99.00, 1);

-- 8. AI 自习室报名表数据
INSERT INTO `study_room_enrollments` (`id`, `parent_name`, `student_name`, `phone`, `status`, `apply_time`) VALUES
('ENR001', '张三爸爸', '张三', '13800000002', 'confirmed', '2023-10-01 10:00:00'),
('ENR002', '王五妈妈', '王小五', '13800000004', 'pending', '2023-10-02 11:30:00');

-- 9. FAQ 分类表数据
INSERT INTO `faq_categories` (`id`, `name`, `sort`, `status`) VALUES
(1, '注册绑定', 1, 1),
(2, '成绩查询', 2, 1),
(3, 'VIP服务', 3, 1),
(4, '课程报名', 4, 1);

-- 10. 常见问题 FAQ 表数据
INSERT INTO `faqs` (`id`, `category_name`, `category_id`, `question`, `answer`, `status`) VALUES
('FAQ001', '注册绑定', 1, '如何绑定学生？', '在小程序“我的”页面，点击“绑定学生”，输入学号和姓名即可完成绑定。', 1),
('FAQ002', '成绩查询', 2, '错题本怎么打印？', '进入错题本页面，选择需要打印的题目，点击“生成打印PDF”，然后可以选择云打印服务。', 1),
('FAQ003', 'VIP服务', 3, 'VIP和SVIP有什么区别？', 'VIP可查看详细成绩分析与基础错题本；SVIP享有额外特权，包括AI专属课程、智能自习室以及个性化学习计划生成。', 1);

-- 11. 微信群配置表数据
INSERT INTO `wechat_configs` (`group_name`, `qr_code_path`, `status`) VALUES
('官方家长交流1群', '/uploads/qrcode1.png', 1),
('初一学习辅导群', '/uploads/qrcode2.png', 1);

-- 12. 错题打印订单表数据
INSERT INTO `print_orders` (`order_no`, `user_name`, `user_phone`, `document_name`, `pages`, `print_type`, `delivery_method`, `total_price`, `order_status`) VALUES
('POD202310010001', '张三爸爸', '13800000002', '张三数学错题本_10月', 15, '黑白双面', '快递配送', 12.50, 4),
('POD202310050002', '李四妈妈', '13800000003', '李四英语复习资料', 30, '彩色单面', '门店自提', 45.00, 1);

-- 13. VIP套餐订单表数据
INSERT INTO `vip_orders` (`order_no`, `user_uid`, `user_name`, `user_phone`, `package_type`, `period`, `price`, `payment_status`, `payment_method`) VALUES
('VOD202309010001', 3, '张三爸爸', '13800000002', 'SVIP专业版', '年包', 365.00, 1, '微信支付'),
('VOD202309150002', 4, '李四妈妈', '13800000003', 'VIP基础版', '季包', 99.00, 1, '支付宝');

-- 14. 系统操作日志表数据
INSERT INTO `sys_logs` (`uid`, `user_name`, `nick_name`, `operation`, `method`, `url`, `ip`, `location`, `status`) VALUES
(1, 'admin', '超级管理员', '登录系统', 'POST', '/api/auth/login/password', '192.168.1.100', '局域网', 200),
(2, 'manager', '运营人员', '查询学生列表', 'GET', '/api/students/list', '192.168.1.101', '局域网', 200);

SET FOREIGN_KEY_CHECKS = 1;
