package com.edu.javasb_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ExamProjectSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSchema() {
        ensureExamProjectColumns();
        ensureExamClassColumns();
        backfillExamProjectData();
        backfillExamClassData();
    }

    private void ensureExamProjectColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("exam_type", "ALTER TABLE exam_projects ADD COLUMN exam_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '考试类型: NORMAL-普通考试, JOINT-联合考试' AFTER name");
        columns.put("selected_school_ids", "ALTER TABLE exam_projects ADD COLUMN selected_school_ids TEXT NULL COMMENT '联合考试选中的学校ID列表(JSON)' AFTER exam_type");
        columns.put("selected_class_ids", "ALTER TABLE exam_projects ADD COLUMN selected_class_ids TEXT NULL COMMENT '普通考试选中的班级ID列表(JSON)' AFTER selected_school_ids");
        columns.put("subject_names", "ALTER TABLE exam_projects ADD COLUMN subject_names TEXT NULL COMMENT '项目科目列表(JSON)' AFTER selected_class_ids");
        columns.put("school_count", "ALTER TABLE exam_projects ADD COLUMN school_count INT DEFAULT 0 COMMENT '覆盖学校数' AFTER subject_names");
        columns.put("class_count", "ALTER TABLE exam_projects ADD COLUMN class_count INT DEFAULT 0 COMMENT '覆盖班级数' AFTER school_count");
        columns.put("student_count", "ALTER TABLE exam_projects ADD COLUMN student_count INT DEFAULT 0 COMMENT '覆盖学生数' AFTER class_count");
        columns.put("subject_count", "ALTER TABLE exam_projects ADD COLUMN subject_count INT DEFAULT 0 COMMENT '科目数' AFTER student_count");
        columns.forEach((column, sql) -> addColumnIfMissing("exam_projects", column, sql));
    }

    private void ensureExamClassColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("school_id", "ALTER TABLE exam_classes ADD COLUMN school_id VARCHAR(50) NULL COMMENT '关联学校ID' AFTER project_id");
        columns.put("source_class_id", "ALTER TABLE exam_classes ADD COLUMN source_class_id VARCHAR(50) NULL COMMENT '关联全局班级ID' AFTER class_name");
        columns.put("student_count", "ALTER TABLE exam_classes ADD COLUMN student_count INT DEFAULT 0 COMMENT '班级学生数' AFTER source_class_id");
        columns.forEach((column, sql) -> addColumnIfMissing("exam_classes", column, sql));
    }

    private void backfillExamProjectData() {
        jdbcTemplate.update(
                "UPDATE exam_projects " +
                        "SET exam_type = COALESCE(exam_type, 'NORMAL'), " +
                        "selected_school_ids = COALESCE(selected_school_ids, '[]'), " +
                        "selected_class_ids = COALESCE(selected_class_ids, '[]'), " +
                        "subject_names = COALESCE(subject_names, '[]'), " +
                        "school_count = COALESCE(school_count, 0), " +
                        "class_count = COALESCE(class_count, 0), " +
                        "student_count = COALESCE(student_count, 0), " +
                        "subject_count = COALESCE(subject_count, 0)"
        );
    }

    private void backfillExamClassData() {
        jdbcTemplate.update(
                "UPDATE exam_classes ec " +
                        "LEFT JOIN schools s ON s.name = ec.school " +
                        "SET ec.school_id = COALESCE(NULLIF(ec.school_id, ''), s.school_id) " +
                        "WHERE ec.school_id IS NULL OR ec.school_id = ''"
        );
        jdbcTemplate.update(
                "UPDATE exam_classes ec " +
                        "LEFT JOIN sys_classes sc ON sc.school_id = ec.school_id " +
                        "AND sc.grade = ec.grade AND sc.alias = ec.class_name " +
                        "SET ec.source_class_id = COALESCE(NULLIF(ec.source_class_id, ''), sc.classid) " +
                        "WHERE ec.source_class_id IS NULL OR ec.source_class_id = ''"
        );
        jdbcTemplate.update(
                "UPDATE exam_classes ec " +
                        "LEFT JOIN (SELECT class_id, COUNT(*) AS cnt FROM students GROUP BY class_id) ss " +
                        "ON ss.class_id = ec.source_class_id " +
                        "SET ec.student_count = COALESCE(ss.cnt, ec.student_count, 0)"
        );
    }

    private void addColumnIfMissing(String tableName, String columnName, String alterSql) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        if (count != null && count == 0) {
            jdbcTemplate.execute(alterSql);
        }
    }
}
