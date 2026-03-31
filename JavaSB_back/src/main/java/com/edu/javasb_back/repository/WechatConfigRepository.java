package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.WechatConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WechatConfigRepository extends JpaRepository<WechatConfig, Integer> {
    List<WechatConfig> findAllByOrderByUpdateTimeDesc();
    List<WechatConfig> findByStatusOrderByUpdateTimeDesc(Integer status);
}
