/*
*******************************************************************************
数据库类型：MySQL 8.0+
项目名称：优题慧家长小程序
文档版本：v1.0
功能描述：包含学校架构、用户学生档案、成绩试卷、错题集、AI建议及系统日志
*******************************************************************************
*/

CREATE DATABASE IF NOT EXISTS youth_hui_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE youth_hui_db;

-- ---------------------------------------------------------
-- 1. 学校与组织架构模块
-- ---------------------------------------------------------

-- 1.1 学校表
CREATE TABLE `schools` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '学校唯一 ID',
    `province` VARCHAR(100) NOT NULL COMMENT '省份，格式："440000_广东省"',
    `city` VARCHAR(100) NOT NULL COMMENT '城市，格式："441900_东莞市"',
    `district` VARCHAR(100) COMMENT '区/县，格式："441900100_松山湖"',
    `school_name` VARCHAR(200) NOT NULL COMMENT '学校名称',
    `school_type` ENUM('primary', 'secondary', 'high') NOT NULL COMMENT '学校阶段:小学/初中/高中',
    `school_code` VARCHAR(50) UNIQUE COMMENT '学校国标编码',
    `address` VARCHAR(255) COMMENT '学校详细地址',
    `contact_phone` VARCHAR(20) COMMENT '学校联系电话',
    `status` TINYINT DEFAULT 1 COMMENT '学校状态: 1-启用, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FULLTEXT KEY `idx_fulltext_school_name` (`school_name`),
    INDEX `idx_region` (`province`, `city`, `district`)
) ENGINE=InnoDB COMMENT='学校基础资料表';

-- 1.2 班级表
CREATE TABLE `classes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '班级唯一 ID',
    `school_id` INT NOT NULL COMMENT '所属学校 ID',
    `grade_level` INT NOT NULL CHECK (`grade_level` BETWEEN 1 AND 12) COMMENT '年级: 1-12',
    `class_number` INT NOT NULL COMMENT '班级号',
    `teacher_id` INT COMMENT '班主任 ID（关联管理账号）',
    `teacher_name` VARCHAR(50) COMMENT '班主任姓名（冗余）',
    `grade_name` VARCHAR(50) NOT NULL COMMENT '年级名称（冗余，如：一年级）',
    `class_fullname` VARCHAR(200) NOT NULL COMMENT '班级全称（冗余）',
    `status` TINYINT DEFAULT 1 COMMENT '班级状态: 1-在读, 0-毕业',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_school_grade_class` (`school_id`, `grade_level`, `class_number`),
    CONSTRAINT `fk_class_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='班级表';

-- ---------------------------------------------------------
-- 2. 用户与权限模块
-- ---------------------------------------------------------

-- 2.1 家长用户表
CREATE TABLE `parents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '家长唯一 ID',
    `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号码（唯一账号）',
    `openid_wx` VARCHAR(100) UNIQUE COMMENT '微信 OpenID',
    `nickname` VARCHAR(100) DEFAULT '优题慧家长' COMMENT '昵称',
    `password` VARCHAR(255) COMMENT '加密后的登录密码',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `id_card` VARCHAR(100) COMMENT '身份证号（加密）',
    `email` VARCHAR(100) COMMENT '邮箱',
    `avatar_url` VARCHAR(255) COMMENT '头像地址',
    `vip_level` ENUM('Normal', 'VIP', 'SVIP') DEFAULT 'Normal' COMMENT '会员等级',
    `vip_expire` DATETIME COMMENT '会员到期时间',
    `status` TINYINT DEFAULT 1 COMMENT '账号状态: 1-正常, 0-禁用',
    `last_login` DATETIME COMMENT '最后登录时间',
    `login_ip` VARCHAR(45) COMMENT '最后登录 IP',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='家长用户表';

-- 2.2 学生档案表
CREATE TABLE `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '学生唯一 ID',
    `student_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '学号/唯一标识（导入匹配键）',
    `student_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `class_id` INT NOT NULL COMMENT '所属班级 ID',
    `school_id` INT NOT NULL COMMENT '所属学校 ID（冗余）',
    `gender` TINYINT DEFAULT 0 COMMENT '性别: 1-男, 2-女, 0-未知',
    `birthday` DATE COMMENT '出生日期',
    `profile_photo` VARCHAR(255) COMMENT '学生头像',
    `parent_count` INT DEFAULT 0 COMMENT '绑定家长数量（冗余）',
    `status` INT DEFAULT 1 COMMENT '状态: 1-在读, 0-毕业/转学',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_class_id` (`class_id`),
    CONSTRAINT `fk_student_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB COMMENT='学生档案表';

-- 2.3 家长学生关联表
CREATE TABLE `parent_student_rel` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联唯一 ID',
    `parent_id` INT NOT NULL COMMENT '家长 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID',
    `relationship` VARCHAR(50) NOT NULL COMMENT '关系说明:爸爸/妈妈等',
    `is_primary` BOOLEAN DEFAULT FALSE COMMENT '是否主账号',
    `unique_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '冗余唯一键:parent_id_student_id',
    `remark` VARCHAR(255) COMMENT '备注',
    `creator_id` INT DEFAULT 0 COMMENT '创建人 ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_student_id` (`student_id`),
    CONSTRAINT `fk_rel_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`),
    CONSTRAINT `fk_rel_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB COMMENT='家长学生关联表';

-- ---------------------------------------------------------
-- 3. 成绩与试卷模块
-- ---------------------------------------------------------

-- 3.1 考试信息表
CREATE TABLE `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '考试唯一 ID',
    `exam_name` VARCHAR(200) NOT NULL COMMENT '考试名称',
    `exam_date` DATE NOT NULL COMMENT '考试日期',
    `school_id` INT NOT NULL COMMENT '组织学校 ID',
    `term` VARCHAR(100) NOT NULL COMMENT '学期，如：2024-2025 第一学期',
    `exam_type` ENUM('月考', '期中', '期末', '模拟', '统考') NOT NULL COMMENT '考试类型',
    `subject_list` JSON NOT NULL COMMENT '考试科目列表 JSON',
    `status` TINYINT DEFAULT 0 COMMENT '考试状态: 1-已发布, 0-未发布',
    `creator_id` INT NOT NULL COMMENT '创建人 ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_exam_school` (`school_id`),
    CONSTRAINT `fk_exam_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB COMMENT='考试信息表';

-- 3.2 成绩记录表
CREATE TABLE `exam_results` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录唯一 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID',
    `exam_id` INT NOT NULL COMMENT '考试 ID',
    `subject` VARCHAR(50) NOT NULL COMMENT '学科: 语文/数学/英语等',
    `total_score` FLOAT NOT NULL COMMENT '总得分',
    `full_score` FLOAT NOT NULL COMMENT '学科满分',
    `score_rate` FLOAT NOT NULL COMMENT '得分率冗余 (total/full)',
    `grade_rank_level` VARCHAR(10) COMMENT '评价等级: A/B/C/D/E',
    `class_rank` INT COMMENT '班级排名',
    `grade_rank` INT COMMENT '年级排名',
    `paper_img_url` TEXT COMMENT '原卷扫描件地址，逗号分隔',
    `teacher_comment` TEXT COMMENT '老师评语',
    `is_approved` BOOLEAN DEFAULT FALSE COMMENT '是否确认发布',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_student_exam_subject` (`student_id`, `exam_id`, `subject`),
    CONSTRAINT `fk_res_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
    CONSTRAINT `fk_res_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`)
) ENGINE=InnoDB COMMENT='成绩记录表';

-- 3.3 小题得分明细表
CREATE TABLE `item_scores` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细 ID',
    `result_id` BIGINT NOT NULL COMMENT '关联成绩 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID（冗余）',
    `question_no` INT NOT NULL COMMENT '题号',
    `question_type` ENUM('选择', '填空', '简答', '计算', '证明') NOT NULL COMMENT '题型',
    `knowledge_point` VARCHAR(200) NOT NULL COMMENT '考查知识点',
    `difficulty_level` ENUM('基础', '综合', '难题') NOT NULL COMMENT '难度',
    `max_score` FLOAT NOT NULL COMMENT '题目满分',
    `actual_score` FLOAT NOT NULL COMMENT '实际得分',
    `is_wrong` BOOLEAN DEFAULT FALSE COMMENT '是否错题',
    `wrong_reason` VARCHAR(255) COMMENT '错误原因',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_item_result` (`result_id`),
    INDEX `idx_wrong_query` (`student_id`, `is_wrong`),
    CONSTRAINT `fk_item_result` FOREIGN KEY (`result_id`) REFERENCES `exam_results` (`id`)
) ENGINE=InnoDB COMMENT='小题得分明细表';

-- ---------------------------------------------------------
-- 4. 错题集与 VIP 扩展模块
-- ---------------------------------------------------------

-- 4.1 错题库
CREATE TABLE `wrong_questions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '错题 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID',
    `item_score_id` BIGINT NOT NULL COMMENT '关联明细 ID',
    `subject` VARCHAR(50) NOT NULL COMMENT '所属学科（冗余）',
    `content_img` TEXT NOT NULL COMMENT '题目图片，逗号分隔',
    `correct_answer` TEXT NOT NULL COMMENT '正确答案',
    `analysis` TEXT NOT NULL COMMENT '解析内容',
    `parent_notes` TEXT COMMENT '家长笔记',
    `tag` VARCHAR(255) COMMENT '自定义分类标签',
    `is_reviewed` BOOLEAN DEFAULT FALSE COMMENT '是否已复习',
    `review_count` INT DEFAULT 0 COMMENT '复习次数',
    `last_review_time` DATETIME COMMENT '最后复习时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_wrong_stu_tag` (`student_id`, `tag`),
    CONSTRAINT `fk_wrong_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB COMMENT='错题库表';

-- 4.2 学习习惯记录表
CREATE TABLE `learning_habits` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID',
    `focus_score` INT NOT NULL CHECK (`focus_score` BETWEEN 1 AND 100),
    `discipline_score` INT NOT NULL CHECK (`discipline_score` BETWEEN 1 AND 100),
    `homework_rate` FLOAT NOT NULL CHECK (`homework_rate` BETWEEN 0 AND 1),
    `total_score` FLOAT NOT NULL COMMENT '综合评分（冗余计算值）',
    `report_date` DATE NOT NULL COMMENT '统计日期',
    `notes` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_stu_date` (`student_id`, `report_date`)
) ENGINE=InnoDB COMMENT='学习习惯雷达图数据表';

-- 4.3 AI 学习建议表
CREATE TABLE `ai_recommendations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '建议 ID',
    `student_id` INT NOT NULL COMMENT '学生 ID',
    `recommend_type` ENUM('日常', '周度', '月度', '考前') NOT NULL COMMENT '建议周期',
    `plan_content` JSON NOT NULL COMMENT '个性化计划 JSON',
    `book_recommend` JSON COMMENT '推荐书目 JSON',
    `is_read` BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    `ai_version` VARCHAR(50) COMMENT 'AI 模型版本',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_stu_ai` (`student_id`)
) ENGINE=InnoDB COMMENT='AI 学习建议表';

-- ---------------------------------------------------------
-- 5. 系统支持模块
-- ---------------------------------------------------------

-- 5.1 常见问题表
CREATE TABLE `faqs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(50) NOT NULL COMMENT '分类',
    `question` VARCHAR(255) NOT NULL COMMENT '问题内容',
    `answer` TEXT NOT NULL COMMENT '解答内容',
    `keyword` VARCHAR(255) NOT NULL COMMENT '搜索关键词（冗余）',
    `search_count` INT DEFAULT 0,
    `sort` INT DEFAULT 0 COMMENT '排序权重',
    `status` TINYINT DEFAULT 1,
    `creator_id` INT NOT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='系统 FAQ 知识库';

-- 5.2 系统操作日志表
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL DEFAULT 0 COMMENT '操作人ID',
    `role` ENUM('Admin', 'Teacher', 'Parent') NOT NULL,
    `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
    `action_type` VARCHAR(50) NOT NULL COMMENT '查询/修改/删除等',
    `content` TEXT NOT NULL COMMENT '操作详情',
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(255) NOT NULL COMMENT '客户端信息',
    `status` TINYINT DEFAULT 1 COMMENT '1-成功, 0-失败',
    `request_id` VARCHAR(100) NOT NULL COMMENT '请求链路唯一ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_query` (`user_id`, `module`, `create_time`)
) ENGINE=InnoDB COMMENT='系统操作审计日志表';