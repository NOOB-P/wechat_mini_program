package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysFaq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SysFaqRepository extends JpaRepository<SysFaq, String> {
    
    @Query("SELECT f FROM SysFaq f WHERE " +
           "(:question IS NULL OR f.question LIKE %:question%) AND " +
           "(:status IS NULL OR f.status = :status)")
    Page<SysFaq> findFaqs(@Param("question") String question,
                          @Param("status") Integer status,
                          Pageable pageable);
}