package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.PaperSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperSubjectRepository extends JpaRepository<PaperSubject, Long> {
    List<PaperSubject> findAllByOrderBySortOrderAsc();
}
