-- 将李四和王五的学校、年级、班级信息修改为与张三（STU001）一致
-- 张三信息：学校 SCH001 (第一中学), 班级 CLS001 (初一 1班)

SET FOREIGN_KEY_CHECKS = 0;

-- 更新 students 表
UPDATE students 
SET school_id = 'SCH001', 
    class_id = 'CLS001', 
    school = '第一中学', 
    grade = '初一', 
    class_name = '1班' 
WHERE student_no IN ('20230002', '20230003');

-- 更新 exam_results 表（冗余数据同步）
UPDATE exam_results 
SET school = '第一中学', 
    grade = '初一', 
    class_name = '1班' 
WHERE student_no IN ('20230002', '20230003');

SET FOREIGN_KEY_CHECKS = 1;
