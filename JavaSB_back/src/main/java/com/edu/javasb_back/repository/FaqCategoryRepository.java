package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.FaqCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqCategoryRepository extends JpaRepository<FaqCategory, Integer> {
    
    @Query("SELECT c.name FROM FaqCategory c WHERE c.status = 1 ORDER BY c.sort ASC")
    List<String> findAllActiveNames();

    List<FaqCategory> findAllByOrderBySortAsc();
}
