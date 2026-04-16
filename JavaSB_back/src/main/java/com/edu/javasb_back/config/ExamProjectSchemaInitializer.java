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
        ensureExamSubjectColumns();
        ensureExamStudentScoreColumns();
        backfillExamProjectData();
        backfillExamClassData();
        backfillExamSubjectData();
        backfillExamStudentScoreData();
        deduplicateExamStudentScores();
        ensureIndexes();
    }

    private void ensureExamProjectColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("exam_type", "ALTER TABLE exam_projects ADD COLUMN exam_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '考试类型: NORMAL-普通考试, JOINT-联合考试' AFTER name");
        columns.put("selected_school_ids", "ALTER TABLE exam_projects ADD COLUMN selected_school_ids TEXT NULL COMMENT '联合考试选中的学校ID列表(JSON)' AFTER exam_type");
        columns.put("selected_class_ids", "ALTER TABLE exam_projects ADD COLUMN selected_class_ids TEXT NULL COMMENT '普通考试选中的班级ID列表(JSON)' AFTER selected_school_ids");
        columns.put("subject_names", "ALTER TABLE exam_projects ADD COLUMN subject_names TEXT NULL COMMENT '项目科目列表(JSON)' AFTER selected_class_ids");
        columns.put("subject_benchmarks", "ALTER TABLE exam_projects ADD COLUMN subject_benchmarks TEXT NULL COMMENT '学科基准分数配置(JSON)' AFTER subject_names");
        columns.put("paper_layouts", "ALTER TABLE exam_projects ADD COLUMN paper_layouts TEXT NULL COMMENT '试卷框选布局配置(JSON)' AFTER subject_benchmarks");
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

    private void ensureExamSubjectColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("paper_url", "ALTER TABLE exam_subjects ADD COLUMN paper_url VARCHAR(500) NULL COMMENT '试卷文件地址' AFTER subject_name");
        columns.put("answer_url", "ALTER TABLE exam_subjects ADD COLUMN answer_url VARCHAR(500) NULL COMMENT '答案文件地址' AFTER paper_url");
        columns.put("score_uploaded", "ALTER TABLE exam_subjects ADD COLUMN score_uploaded TINYINT(1) DEFAULT 0 COMMENT '是否已同步成绩' AFTER answer_url");
        columns.forEach((column, sql) -> addColumnIfMissing("exam_subjects", column, sql));
    }

    private void ensureExamStudentScoreColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("answer_sheet_url", "ALTER TABLE exam_student_scores ADD COLUMN answer_sheet_url VARCHAR(500) NULL COMMENT '学生试卷原卷路径' AFTER student_name");
        columns.put("score_entered", "ALTER TABLE exam_student_scores ADD COLUMN score_entered TINYINT(1) DEFAULT 0 COMMENT '成绩是否已录入' AFTER answer_sheet_url");
        columns.forEach((column, sql) -> addColumnIfMissing("exam_student_scores", column, sql));
    }

    private void backfillExamProjectData() {
        jdbcTemplate.update(
                "UPDATE exam_projects " +
                        "SET exam_type = COALESCE(exam_type, 'NORMAL'), " +
                        "selected_school_ids = COALESCE(selected_school_ids, '[]'), " +
                        "selected_class_ids = COALESCE(selected_class_ids, '[]'), " +
                        "subject_names = COALESCE(subject_names, '[]'), " +
                        "subject_benchmarks = COALESCE(subject_benchmarks, '{}'), " +
                        "paper_layouts = COALESCE(paper_layouts, '{}'), " +
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

    private void backfillExamSubjectData() {
        jdbcTemplate.update(
                "UPDATE exam_subjects es " +
                        "LEFT JOIN (SELECT subject_id, COUNT(*) AS cnt FROM exam_student_scores WHERE COALESCE(score_entered, 0) = 1 GROUP BY subject_id) ess " +
                        "ON ess.subject_id = es.id " +
                        "SET es.score_uploaded = CASE WHEN COALESCE(ess.cnt, 0) > 0 THEN 1 ELSE COALESCE(es.score_uploaded, 0) END"
        );
    }

    private void backfillExamStudentScoreData() {
        jdbcTemplate.update(
                "UPDATE exam_student_scores " +
                        "SET score_entered = CASE " +
                        "WHEN score_entered IS NULL THEN 1 " +
                        "ELSE score_entered END, " +
                        "answer_sheet_url = COALESCE(answer_sheet_url, '')"
        );
    }

    private void deduplicateExamStudentScores() {
        jdbcTemplate.update(
                "DELETE ess1 FROM exam_student_scores ess1 " +
                        "INNER JOIN exam_student_scores ess2 " +
                        "ON ess1.subject_id = ess2.subject_id " +
                        "AND ess1.student_no = ess2.student_no " +
                        "AND ess1.id < ess2.id"
        );
    }

    private void ensureIndexes() {
        addIndexIfMissing(
                "exam_subjects",
                "idx_exam_subject_class_name",
                "CREATE INDEX idx_exam_subject_class_name ON exam_subjects(class_id, subject_name)"
        );
        addIndexIfMissing(
                "exam_student_scores",
                "uk_exam_student_score_subject_student",
                "ALTER TABLE exam_student_scores ADD CONSTRAINT uk_exam_student_score_subject_student UNIQUE (subject_id, student_no)"
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

    private void addIndexIfMissing(String tableName, String indexName, String createSql) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
                Integer.class,
                tableName,
                indexName
        );
        if (count != null && count == 0) {
            jdbcTemplate.execute(createSql);
        }
    }
}
