package com.edu.javasb_back.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edu.javasb_back.model.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    /**
     * 使用 SQL 原生语句查询所有常规课程列表
     */
    @Query(value = "SELECT * FROM courses WHERE type = 'general' AND status = 1 ORDER BY create_time DESC", nativeQuery = true)
    List<Course> findAllGeneralCoursesSql();

    /**
     * 使用 SQL 原生语句查询同步课程列表
     */
    @Query(value = "SELECT * FROM courses WHERE type = 'sync' AND status = 1 " +
                   "AND (:subject IS NULL OR subject = :subject) " +
                   "AND (:grade IS NULL OR grade = :grade) ORDER BY create_time DESC", nativeQuery = true)
    List<Course> findSyncCoursesSql(@Param("subject") String subject, @Param("grade") String grade);

    /**
     * 使用 SQL 原生语句查询家庭教育列表
     */
    @Query(value = "SELECT * FROM courses WHERE type = 'family' AND status = 1 ORDER BY create_time DESC", nativeQuery = true)
    List<Course> findFamilyEduListSql();

    /**
     * 使用 SQL 原生语句查询所有学霸说列表
     */
    @Query(value = "SELECT * FROM courses WHERE type = 'talk' AND status = 1 ORDER BY create_time DESC", nativeQuery = true)
    List<Course> findStudentTalkListSql();

    /**
     * 详情查询
     */
    @Query(value = "SELECT * FROM courses WHERE id = :id", nativeQuery = true)
    Optional<Course> findByIdSql(@Param("id") String id);

    /**
     * 使用 SQL 原生语句查询同步课程的选项 (年级和科目)
     */
    @Query(value = "SELECT DISTINCT grade as label, grade as value FROM courses WHERE type = 'sync' AND grade IS NOT NULL", nativeQuery = true)
    List<Map<String, Object>> findSyncGradeOptionsSql();

    @Query(value = "SELECT DISTINCT subject as label, subject as value FROM courses WHERE type = 'sync' AND subject IS NOT NULL", nativeQuery = true)
    List<Map<String, Object>> findSyncSubjectOptionsSql();
    
    /**
     * 查询我的课程 (用户点击过的)
     */
    @Query(value = "SELECT c.* FROM courses c JOIN user_courses uc ON c.id = uc.course_id WHERE uc.user_uid = :uid ORDER BY uc.create_time DESC", nativeQuery = true)
    List<Course> findMyCoursesSql(@Param("uid") Long uid);

    /**
     * 查询我的收藏
     */
    @Query(value = "SELECT c.* FROM courses c JOIN user_collections uc ON c.id = uc.course_id WHERE uc.user_uid = :uid ORDER BY uc.create_time DESC", nativeQuery = true)
    List<Course> findMyCollectionsSql(@Param("uid") Long uid);

    /**
     * 查询学习记录 (返回 Map 以便包含 progress)
     */
    @Query(value = "SELECT c.*, usr.progress FROM courses c JOIN user_study_records usr ON c.id = usr.course_id WHERE usr.user_uid = :uid ORDER BY usr.last_study_time DESC", nativeQuery = true)
    List<Map<String, Object>> findStudyRecordsSql(@Param("uid") Long uid);

    /**
     * 管理端：按条件查询课程
     */
    @Query(value = "SELECT * FROM courses WHERE " +
                   "(:type IS NULL OR type = :type) AND " +
                   "(:isSvipOnly IS NULL OR is_svip_only = :isSvipOnly) AND " +
                   "(:isFree IS NULL OR (price = 0) = :isFree) AND " +
                   "(:isRecommend IS NULL OR is_recommend = :isRecommend) " +
                   "ORDER BY create_time DESC", nativeQuery = true)
    List<Course> findAllCoursesFilteredSql(@Param("type") String type, @Param("isSvipOnly") Boolean isSvipOnly, @Param("isFree") Boolean isFree, @Param("isRecommend") Integer isRecommend);
}
