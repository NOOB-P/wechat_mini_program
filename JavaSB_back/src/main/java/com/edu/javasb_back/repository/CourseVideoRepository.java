package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.CourseVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseVideoRepository extends JpaRepository<CourseVideo, String> {
    List<CourseVideo> findByEpisodeIdOrderBySortOrderAsc(String episodeId);
    void deleteByEpisodeId(String episodeId);
}
