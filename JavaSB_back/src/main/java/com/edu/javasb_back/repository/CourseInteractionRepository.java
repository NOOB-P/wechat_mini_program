package com.edu.javasb_back.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.edu.javasb_back.model.entity.Course; // We need a dummy entity for CrudRepository

@Repository
public interface CourseInteractionRepository extends CrudRepository<Course, String> {

    /**
     * 记录“我的课程” (点击进入)
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO user_courses (user_uid, course_id, create_time) VALUES (:uid, :courseId, NOW())", nativeQuery = true)
    int recordMyCourseSql(@Param("uid") Long uid, @Param("courseId") String courseId);

    /**
     * 记录“我的收藏”
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO user_collections (user_uid, course_id, create_time) VALUES (:uid, :courseId, NOW())", nativeQuery = true)
    int addCollectionSql(@Param("uid") Long uid, @Param("courseId") String courseId);

    /**
     * 取消收藏
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_collections WHERE user_uid = :uid AND course_id = :courseId", nativeQuery = true)
    int removeCollectionSql(@Param("uid") Long uid, @Param("courseId") String courseId);

    /**
     * 检查是否已收藏
     */
    @Query(value = "SELECT COUNT(*) FROM user_collections WHERE user_uid = :uid AND course_id = :courseId", nativeQuery = true)
    int checkIsCollectedSql(@Param("uid") Long uid, @Param("courseId") String courseId);

    /**
     * 记录“学习记录” (点击立即学习)
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_study_records (user_uid, course_id, progress, last_study_time, create_time) " +
                   "VALUES (:uid, :courseId, :progress, NOW(), NOW()) " +
                   "ON DUPLICATE KEY UPDATE progress = :progress, last_study_time = NOW()", nativeQuery = true)
    int recordStudyRecordSql(@Param("uid") Long uid, @Param("courseId") String courseId, @Param("progress") Integer progress);
}
