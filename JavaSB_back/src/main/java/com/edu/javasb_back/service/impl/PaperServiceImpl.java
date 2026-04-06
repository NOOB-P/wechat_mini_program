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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaperServiceImpl implements PaperService {

    @Autowired
    private ExamPaperRepository paperRepository;

    @Autowired
    private PaperSubjectRepository subjectRepository;

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
    public ExamPaper savePaper(ExamPaper paper) {
        return paperRepository.save(paper);
    }

    @Override
    public void deletePaper(Long id) {
        paperRepository.deleteById(id);
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
