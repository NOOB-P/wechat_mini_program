package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.model.entity.ExamPaper;
import com.edu.javasb_back.model.entity.PaperSubject;
import com.edu.javasb_back.repository.ExamPaperRepository;
import com.edu.javasb_back.repository.PaperSubjectRepository;
import com.edu.javasb_back.service.PaperService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaperServiceImpl implements PaperService {

    @Autowired
    private ExamPaperRepository paperRepository;

    @Autowired
    private PaperSubjectRepository subjectRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public Page<ExamPaper> getPaperList(String keyword, String subject, String grade, String type, Boolean isRecommend, Pageable pageable) {
        Specification<ExamPaper> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("title"), "%" + keyword + "%"));
            }
            if (subject != null && !subject.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("subject"), subject));
            }
            if (grade != null && !grade.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("grade"), grade));
            }
            if (type != null && !type.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            if (isRecommend != null) {
                predicates.add(criteriaBuilder.equal(root.get("isRecommend"), isRecommend));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return paperRepository.findAll(spec, pageable);
    }

    @Override
    public List<Map<String, Object>> getTypeStatistics() {
        String jpql = "SELECT e.type as type, COUNT(e) as count FROM ExamPaper e GROUP BY e.type";
        List<Object[]> results = entityManager.createQuery(jpql, Object[].class).getResultList();
        List<Map<String, Object>> stats = new ArrayList<>();
        
        // 定义预设的类型及其显示名称
        Map<String, String> typeMap = new HashMap<>();
        typeMap.put("FAMOUS", "名校试卷");
        typeMap.put("MONTHLY", "月考试卷");
        typeMap.put("JOINT", "联考试卷");

        // 初始化
        for (Map.Entry<String, String> entry : typeMap.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", entry.getKey());
            map.put("name", entry.getValue());
            map.put("count", 0L);
            stats.add(map);
        }

        // 填充数据
        for (Object[] result : results) {
            String type = (String) result[0];
            Long count = (Long) result[1];
            for (Map<String, Object> map : stats) {
                if (map.get("id").equals(type)) {
                    map.put("count", count);
                    break;
                }
            }
        }
        return stats;
    }

    @Override
    public List<Map<String, Object>> getGradeStatistics(String type) {
        String jpql = "SELECT e.grade as grade, COUNT(e) as count FROM ExamPaper e WHERE e.type = :type GROUP BY e.grade";
        List<Object[]> results = entityManager.createQuery(jpql, Object[].class)
                .setParameter("type", type)
                .getResultList();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", result[0]);
            map.put("count", result[1]);
            stats.add(map);
        }
        return stats;
    }

    @Override
    public List<Map<String, Object>> getSubjectStatistics(String type, String grade) {
        String jpql = "SELECT e.subject as subject, COUNT(e) as count FROM ExamPaper e WHERE e.type = :type AND e.grade = :grade GROUP BY e.subject";
        List<Object[]> results = entityManager.createQuery(jpql, Object[].class)
                .setParameter("type", type)
                .setParameter("grade", grade)
                .getResultList();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", result[0]);
            map.put("count", result[1]);
            stats.add(map);
        }
        return stats;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ExamPaper savePaper(ExamPaper paper) {
        if (paper.getId() == null) {
            // 新增：处理冲突并保存
            optimizePaperSort(paper.getType(), paper.getGrade(), paper.getSubject(), paper.getSortOrder(), null);
            ExamPaper saved = paperRepository.save(paper);
            normalizePaperSort(paper.getType(), paper.getGrade(), paper.getSubject());
            return saved;
        } else {
            // 更新：检查排序是否变化
            ExamPaper old = paperRepository.findById(paper.getId()).orElse(null);
            if (old != null && !old.getSortOrder().equals(paper.getSortOrder())) {
                optimizePaperSort(paper.getType(), paper.getGrade(), paper.getSubject(), paper.getSortOrder(), paper.getId());
            }
            ExamPaper saved = paperRepository.save(paper);
            normalizePaperSort(paper.getType(), paper.getGrade(), paper.getSubject());
            return saved;
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deletePaper(Long id) {
        paperRepository.findById(id).ifPresent(paper -> {
            String type = paper.getType();
            String grade = paper.getGrade();
            String subject = paper.getSubject();
            paperRepository.deleteById(id);
            normalizePaperSort(type, grade, subject);
        });
    }

    /**
     * 优化试卷排序逻辑
     */
    private void optimizePaperSort(String type, String grade, String subject, Integer targetSort, Long excludeId) {
        Specification<ExamPaper> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("type"), type));
            predicates.add(cb.equal(root.get("grade"), grade));
            predicates.add(cb.equal(root.get("subject"), subject));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        List<ExamPaper> list = paperRepository.findAll(spec, Sort.by("sortOrder").ascending().and(Sort.by("createTime").ascending()));
        
        int currentSort = targetSort;
        for (ExamPaper p : list) {
            if (excludeId != null && p.getId().equals(excludeId)) continue;
            
            if (p.getSortOrder() >= currentSort) {
                p.setSortOrder(p.getSortOrder() + 1);
                paperRepository.save(p);
            }
        }
    }

    /**
     * 归一化试卷排序逻辑
     */
    private void normalizePaperSort(String type, String grade, String subject) {
        Specification<ExamPaper> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("type"), type));
            predicates.add(cb.equal(root.get("grade"), grade));
            predicates.add(cb.equal(root.get("subject"), subject));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        List<ExamPaper> list = paperRepository.findAll(spec, Sort.by("sortOrder").ascending().and(Sort.by("createTime").ascending()));
        
        for (int i = 0; i < list.size(); i++) {
            ExamPaper p = list.get(i);
            int newSort = i + 1;
            if (p.getSortOrder() != newSort) {
                p.setSortOrder(newSort);
                paperRepository.save(p);
            }
        }
    }

    @Override
    public ExamPaper getPaperById(Long id) {
        return paperRepository.findById(id).orElse(null);
    }

    @Override
    public void incrementDownloadCount(Long id) {
        paperRepository.findById(id).ifPresent(paper -> {
            paper.setDownloads(paper.getDownloads() + 1);
            paperRepository.save(paper);
        });
    }

    @Override
    public List<PaperSubject> getAllSubjects() {
        return subjectRepository.findAllByOrderBySortOrderAsc();
    }

    @Override
    public PaperSubject saveSubject(PaperSubject subject) {
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
}
