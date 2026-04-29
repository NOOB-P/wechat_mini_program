package com.edu.javasb_back.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ExamProjectSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void initializeSchema() {
        ensureExamProjectColumns();
        ensureExamClassColumns();
        ensureExamSubjectColumns();
        ensureExamStudentScoreColumns();
        backfillExamProjectData();
        backfillExamClassData();
        backfillExamSubjectProjectIds();
        migrateProjectPaperConfigToSubjects();
        mergeDuplicateExamSubjectsByProject();
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
        columns.put("school_count", "ALTER TABLE exam_projects ADD COLUMN school_count INT DEFAULT 0 COMMENT '覆盖学校数' AFTER subject_benchmarks");
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
        columns.put("project_id", "ALTER TABLE exam_subjects ADD COLUMN project_id VARCHAR(50) NULL COMMENT '关联考试项目ID' AFTER id");
        columns.put("paper_url", "ALTER TABLE exam_subjects ADD COLUMN paper_url VARCHAR(500) NULL COMMENT '试卷文件地址' AFTER subject_name");
        columns.put("answer_url", "ALTER TABLE exam_subjects ADD COLUMN answer_url VARCHAR(500) NULL COMMENT '答案文件地址' AFTER paper_url");
        columns.put("paper_merge_info", "ALTER TABLE exam_subjects ADD COLUMN paper_merge_info TEXT NULL COMMENT '试卷PDF/多图合并分页信息(JSON)' AFTER answer_url");
        columns.put("answer_merge_info", "ALTER TABLE exam_subjects ADD COLUMN answer_merge_info TEXT NULL COMMENT '答案PDF/多图合并分页信息(JSON)' AFTER paper_merge_info");
        columns.put("paper_layouts", "ALTER TABLE exam_subjects ADD COLUMN paper_layouts TEXT NULL COMMENT '单科原卷框选布局(JSON)' AFTER answer_merge_info");
        columns.put("answers_layouts", "ALTER TABLE exam_subjects ADD COLUMN answers_layouts TEXT NULL COMMENT '单科模板答题卡框选布局(JSON)' AFTER paper_layouts");
        columns.put("score_uploaded", "ALTER TABLE exam_subjects ADD COLUMN score_uploaded TINYINT(1) DEFAULT 0 COMMENT '是否已同步成绩' AFTER answers_layouts");
        columns.forEach((column, sql) -> addColumnIfMissing("exam_subjects", column, sql));
    }

    private void ensureExamStudentScoreColumns() {
        Map<String, String> columns = new LinkedHashMap<>();
        columns.put("answer_sheet_url", "ALTER TABLE exam_student_scores ADD COLUMN answer_sheet_url VARCHAR(500) NULL COMMENT '学生试卷原卷路径' AFTER student_name");
        columns.put("answer_merge_info", "ALTER TABLE exam_student_scores ADD COLUMN answer_merge_info TEXT NULL COMMENT '答卷PDF/多图合并分页信息(JSON)' AFTER answer_sheet_url");
        columns.put("answer_sheet_layouts", "ALTER TABLE exam_student_scores ADD COLUMN answer_sheet_layouts TEXT NULL COMMENT '学生原卷框选布局(JSON)' AFTER answer_merge_info");
        columns.put("score_entered", "ALTER TABLE exam_student_scores ADD COLUMN score_entered TINYINT(1) DEFAULT 0 COMMENT '成绩是否已录入' AFTER answer_sheet_layouts");
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

    private void backfillExamSubjectProjectIds() {
        if (!columnExists("exam_subjects", "project_id") || !columnExists("exam_subjects", "class_id")) {
            return;
        }
        jdbcTemplate.update(
                "UPDATE exam_subjects es " +
                        "LEFT JOIN exam_classes ec ON ec.id = es.class_id " +
                        "SET es.project_id = COALESCE(NULLIF(es.project_id, ''), ec.project_id) " +
                        "WHERE es.project_id IS NULL OR es.project_id = ''"
        );
    }

    private void migrateProjectPaperConfigToSubjects() {
        if (!columnExists("exam_projects", "paper_layouts")
                && !columnExists("exam_projects", "paper_merge_info")) {
            return;
        }
        List<Map<String, Object>> projects = jdbcTemplate.queryForList(
                "SELECT id, " +
                        (columnExists("exam_projects", "paper_layouts") ? "paper_layouts" : "NULL AS paper_layouts") + ", " +
                        (columnExists("exam_projects", "paper_merge_info") ? "paper_merge_info" : "NULL AS paper_merge_info") + " " +
                        "FROM exam_projects"
        );
        for (Map<String, Object> project : projects) {
            String projectId = asString(project.get("id"));
            if (!StringUtils.hasText(projectId)) {
                continue;
            }
            Map<String, Object> projectLayouts = readJsonMap(project.get("paper_layouts"));
            Map<String, Object> projectMergeInfo = readJsonMap(project.get("paper_merge_info"));
            List<Map<String, Object>> subjects = jdbcTemplate.queryForList(
                    "SELECT id, subject_name, paper_layouts, answers_layouts, paper_merge_info, answer_merge_info " +
                            "FROM exam_subjects WHERE project_id = ?",
                    projectId
            );
            for (Map<String, Object> subject : subjects) {
                String subjectId = asString(subject.get("id"));
                String subjectName = asString(subject.get("subject_name"));
                if (!StringUtils.hasText(subjectId) || !StringUtils.hasText(subjectName)) {
                    continue;
                }
                boolean updated = false;
                String currentPaperLayouts = asString(subject.get("paper_layouts"));
                String currentAnswersLayouts = asString(subject.get("answers_layouts"));
                String currentPaperMergeInfo = asString(subject.get("paper_merge_info"));
                String currentAnswerMergeInfo = asString(subject.get("answer_merge_info"));

                Map<String, Object> subjectLayoutNode = nestedMap(projectLayouts.get(subjectName));
                if (!StringUtils.hasText(currentPaperLayouts)) {
                    List<Map<String, Object>> originalLayouts = mapList(subjectLayoutNode.get("original"));
                    if (!originalLayouts.isEmpty()) {
                        currentPaperLayouts = writeJson(originalLayouts);
                        updated = true;
                    }
                }
                if (!StringUtils.hasText(currentAnswersLayouts)) {
                    List<Map<String, Object>> templateLayouts = mapList(subjectLayoutNode.get("template"));
                    if (!templateLayouts.isEmpty()) {
                        currentAnswersLayouts = writeJson(templateLayouts);
                        updated = true;
                    }
                }

                Map<String, Object> subjectMergeNode = nestedMap(projectMergeInfo.get(subjectName));
                if (!StringUtils.hasText(currentPaperMergeInfo)) {
                    Map<String, Object> originalMergeInfo = nestedMap(subjectMergeNode.get("original"));
                    if (!originalMergeInfo.isEmpty()) {
                        currentPaperMergeInfo = writeJson(originalMergeInfo);
                        updated = true;
                    }
                }
                if (!StringUtils.hasText(currentAnswerMergeInfo)) {
                    Map<String, Object> templateMergeInfo = nestedMap(subjectMergeNode.get("template"));
                    if (!templateMergeInfo.isEmpty()) {
                        currentAnswerMergeInfo = writeJson(templateMergeInfo);
                        updated = true;
                    }
                }

                if (updated) {
                    jdbcTemplate.update(
                            "UPDATE exam_subjects SET paper_layouts = ?, answers_layouts = ?, paper_merge_info = ?, answer_merge_info = ? WHERE id = ?",
                            emptyToNull(currentPaperLayouts),
                            emptyToNull(currentAnswersLayouts),
                            emptyToNull(currentPaperMergeInfo),
                            emptyToNull(currentAnswerMergeInfo),
                            subjectId
                    );
                }
            }
        }
    }

    private void mergeDuplicateExamSubjectsByProject() {
        if (!columnExists("exam_subjects", "project_id")) {
            return;
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id, project_id, subject_name, paper_url, answer_url, paper_merge_info, answer_merge_info, paper_layouts, answers_layouts, score_uploaded, create_time " +
                        "FROM exam_subjects " +
                        "WHERE project_id IS NOT NULL AND project_id <> '' " +
                        "ORDER BY project_id, subject_name, create_time, id"
        );
        Map<String, List<Map<String, Object>>> groupedRows = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String key = asString(row.get("project_id")) + "#" + asString(row.get("subject_name"));
            groupedRows.computeIfAbsent(key, ignored -> new ArrayList<>()).add(row);
        }
        for (List<Map<String, Object>> group : groupedRows.values()) {
            if (group.size() <= 1) {
                continue;
            }
            Map<String, Object> canonical = group.get(0);
            String canonicalId = asString(canonical.get("id"));
            String paperUrl = firstNonBlank(group, "paper_url");
            String answerUrl = firstNonBlank(group, "answer_url");
            String paperMergeInfo = firstNonBlank(group, "paper_merge_info");
            String answerMergeInfo = firstNonBlank(group, "answer_merge_info");
            String paperLayouts = firstNonBlank(group, "paper_layouts");
            String answersLayouts = firstNonBlank(group, "answers_layouts");
            boolean scoreUploaded = group.stream().anyMatch(item -> asBoolean(item.get("score_uploaded")));

            jdbcTemplate.update(
                    "UPDATE exam_subjects SET paper_url = ?, answer_url = ?, paper_merge_info = ?, answer_merge_info = ?, paper_layouts = ?, answers_layouts = ?, score_uploaded = ? WHERE id = ?",
                    emptyToNull(paperUrl),
                    emptyToNull(answerUrl),
                    emptyToNull(paperMergeInfo),
                    emptyToNull(answerMergeInfo),
                    emptyToNull(paperLayouts),
                    emptyToNull(answersLayouts),
                    scoreUploaded ? 1 : 0,
                    canonicalId
            );

            for (int index = 1; index < group.size(); index++) {
                String duplicateId = asString(group.get(index).get("id"));
                jdbcTemplate.update("UPDATE exam_student_scores SET subject_id = ? WHERE subject_id = ?", canonicalId, duplicateId);
                jdbcTemplate.update("DELETE FROM exam_subjects WHERE id = ?", duplicateId);
            }
        }
    }

    private void backfillExamSubjectData() {
        jdbcTemplate.update(
                "UPDATE exam_subjects " +
                        "SET paper_layouts = COALESCE(paper_layouts, '[]'), " +
                        "answers_layouts = COALESCE(answers_layouts, '[]'), " +
                        "score_uploaded = COALESCE(score_uploaded, 0)"
        );
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
                "idx_exam_subject_project_name",
                "CREATE INDEX idx_exam_subject_project_name ON exam_subjects(project_id, subject_name)"
        );
        addIndexIfMissing(
                "exam_subjects",
                "uk_exam_subject_project_name",
                "ALTER TABLE exam_subjects ADD CONSTRAINT uk_exam_subject_project_name UNIQUE (project_id, subject_name)"
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

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }

    private Map<String, Object> readJsonMap(Object value) {
        String json = asString(value);
        if (!StringUtils.hasText(json)) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private List<Map<String, Object>> mapList(Object value) {
        if (!(value instanceof List<?> list)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> mapValue) {
                Map<String, Object> row = new LinkedHashMap<>();
                mapValue.forEach((key, itemValue) -> row.put(String.valueOf(key), itemValue));
                rows.add(row);
            }
        }
        return rows;
    }

    private Map<String, Object> nestedMap(Object value) {
        if (!(value instanceof Map<?, ?> mapValue)) {
            return Collections.emptyMap();
        }
        Map<String, Object> row = new LinkedHashMap<>();
        mapValue.forEach((key, itemValue) -> row.put(String.valueOf(key), itemValue));
        return row;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ignored) {
            return "";
        }
    }

    private String firstNonBlank(List<Map<String, Object>> rows, String fieldName) {
        for (Map<String, Object> row : rows) {
            String value = asString(row.get(fieldName));
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        String text = asString(value);
        return "1".equals(text) || "true".equalsIgnoreCase(text);
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }
}
