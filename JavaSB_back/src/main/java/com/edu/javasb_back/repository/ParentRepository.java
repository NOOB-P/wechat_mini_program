package com.edu.javasb_back.repository;

import com.edu.javasb_back.model.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Integer> {
    Optional<Parent> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
