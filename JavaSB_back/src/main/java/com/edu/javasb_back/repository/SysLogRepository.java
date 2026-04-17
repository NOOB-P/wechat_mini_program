package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.SysLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SysLogRepository extends JpaRepository<SysLog, Long> {
    
    @Query("SELECT l FROM SysLog l WHERE " +
           "(:userName IS NULL OR l.userName LIKE %:userName%) AND " +
           "(:operation IS NULL OR l.operation LIKE %:operation%) AND " +
           "(:status IS NULL OR l.status = :status)")
    Page<SysLog> findLogs(@Param("userName") String userName, 
                          @Param("operation") String operation, 
                          @Param("status") Integer status, 
                          Pageable pageable);
}
