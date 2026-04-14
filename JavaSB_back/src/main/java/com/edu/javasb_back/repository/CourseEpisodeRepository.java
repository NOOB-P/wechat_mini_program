package com.edu.javasb_back.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.edu.javasb_back.model.entity.CourseEpisode;

@Repository
public interface CourseEpisodeRepository extends JpaRepository<CourseEpisode, String> {
    List<CourseEpisode> findByCourseIdOrderBySortOrderAscCreateTimeAsc(String courseId);

    
    @Modifying
    @Query(value = "DELETE FROM course_episodes WHERE course_id = :courseId", nativeQuery = true)
    void deleteByCourseId(String courseId);
}
