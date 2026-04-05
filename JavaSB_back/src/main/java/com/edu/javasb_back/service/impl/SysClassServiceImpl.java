package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.service.SysClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SysClassServiceImpl implements SysClassService {

    @Autowired
    private SysClassRepository sysClassRepository;

    @Override
    public Page<SysClass> getClasses(int page, int size, String classid, String grade) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Specification<SysClass> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(classid)) {
                predicates.add(criteriaBuilder.like(root.get("classid"), "%" + classid + "%"));
            }
            if (StringUtils.hasText(grade)) {
                predicates.add(criteriaBuilder.like(root.get("grade"), "%" + grade + "%"));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return sysClassRepository.findAll(spec, pageable);
    }

    @Override
    public SysClass createClass(SysClass sysClass) {
        if (sysClassRepository.existsByClassid(sysClass.getClassid())) {
            throw new RuntimeException("班级ID已存在");
        }
        return sysClassRepository.save(sysClass);
    }

    @Override
    public SysClass updateClass(Long id, SysClass sysClass) {
        SysClass existing = sysClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        if (!existing.getClassid().equals(sysClass.getClassid()) && 
            sysClassRepository.existsByClassid(sysClass.getClassid())) {
            throw new RuntimeException("班级ID已存在");
        }
        
        existing.setClassid(sysClass.getClassid());
        existing.setGrade(sysClass.getGrade());
        existing.setAlias(sysClass.getAlias());
        
        return sysClassRepository.save(existing);
    }

    @Override
    public void deleteClass(Long id) {
        sysClassRepository.deleteById(id);
    }

    @Override
    public SysClass getClassById(Long id) {
        return sysClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
    }
}
