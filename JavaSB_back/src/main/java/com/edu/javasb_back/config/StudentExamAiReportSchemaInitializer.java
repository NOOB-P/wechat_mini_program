package com.edu.javasb_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class StudentExamAiReportSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSchema() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS student_exam_ai_reports (
                    id VARCHAR(50) PRIMARY KEY COMMENT 'AI报告ID',
                    project_id VARCHAR(50) NOT NULL COMMENT '考试项目ID',
                    student_no VARCHAR(50) NOT NULL COMMENT '学生学号',
                    student_name VARCHAR(50) NULL COMMENT '学生姓名',
                    school_id VARCHAR(50) NULL COMMENT '学校ID',
                    class_id VARCHAR(50) NULL COMMENT '班级ID',
                    model_name VARCHAR(100) NULL COMMENT '模型名称',
                    prompt_version VARCHAR(50) NULL COMMENT '提示词版本',
                    report_content LONGTEXT NULL COMMENT 'AI报告内容(JSON)',
                    source_snapshot LONGTEXT NULL COMMENT '生成报告时使用的原始快照(JSON)',
                    status VARCHAR(20) DEFAULT 'SUCCESS' COMMENT '状态',
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                    UNIQUE KEY uk_student_exam_ai_report (project_id, student_no)
                ) ENGINE=InnoDB COMMENT='学生考试AI分析报告缓存表'
                """);
    }
}
