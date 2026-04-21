package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.service.ExamSubjectService;
import com.edu.javasb_back.service.OssStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ExamSubjectServiceImpl implements ExamSubjectService {

    @Autowired
    private ExamSubjectRepository examSubjectRepository;

    @Autowired
    private ExamClassRepository examClassRepository;

    @Autowired
    private OssStorageService ossStorageService;

    @Override
    public Result<Map<String, Object>> getSubjectList(String classId) {
        if (!StringUtils.hasText(classId)) {
            return Result.error("班级ID不能为空");
        }
        if (!examClassRepository.existsById(classId)) {
            return Result.error("考试班级不存在");
        }

        List<ExamSubject> records = examSubjectRepository.findByClassIdOrderBySubjectNameAsc(classId);
        Map<String, Object> data = new HashMap<>();
        data.put("records", records);
        data.put("total", records.size());
        return Result.success("获取成功", data);
    }

    @Override
    @Transactional
    public Result<Void> addSubject(ExamSubject examSubject) {
        if (examSubject == null || !StringUtils.hasText(examSubject.getClassId())) {
            return Result.error("班级ID不能为空");
        }
        if (!StringUtils.hasText(examSubject.getSubjectName())) {
            return Result.error("科目名称不能为空");
        }

        ExamClass examClass = examClassRepository.findById(examSubject.getClassId()).orElse(null);
        if (examClass == null) {
            return Result.error("考试班级不存在");
        }

        if (examSubjectRepository.findFirstByClassIdAndSubjectName(
                examSubject.getClassId(),
                examSubject.getSubjectName().trim()).isPresent()) {
            return Result.error("当前班级已存在该科目");
        }

        examSubject.setId("ES" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 6));
        examSubject.setSubjectName(examSubject.getSubjectName().trim());
        if (examSubject.getScoreUploaded() == null) {
            examSubject.setScoreUploaded(Boolean.FALSE);
        }
        examSubjectRepository.save(examSubject);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteSubject(String id) {
        if (!StringUtils.hasText(id)) {
            return Result.error("科目ID不能为空");
        }
        if (!examSubjectRepository.existsById(id)) {
            return Result.error("考试科目不存在");
        }
        examSubjectRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @Override
    @Transactional
    public Result<String> uploadSubjectFile(String subjectId, String type, MultipartFile file) {
        if (!StringUtils.hasText(subjectId)) {
            return Result.error("科目ID不能为空");
        }
        if (!StringUtils.hasText(type)) {
            return Result.error("上传类型不能为空");
        }
        if (file == null || file.isEmpty()) {
            return Result.error("请上传文件");
        }

        ExamSubject subject = examSubjectRepository.findById(subjectId).orElse(null);
        if (subject == null) {
            return Result.error("考试科目不存在");
        }

        if (!"paper".equals(type) && !"answer".equals(type)) {
            return Result.error("当前页面仅支持上传班级试卷或答案文件");
        }

        String originalFilename = file.getOriginalFilename();
        if (!isAllowedPaperFile(originalFilename)) {
            return Result.error("仅支持上传 pdf、png、jpg、jpeg 格式文件");
        }

        try (InputStream inputStream = file.getInputStream()) {
            String storedUrl = storeSubjectFile(inputStream, subject.getClassId(), subject.getSubjectName(), type, originalFilename);
            if ("paper".equals(type)) {
                subject.setPaperUrl(storedUrl);
            } else {
                subject.setAnswerUrl(storedUrl);
            }
            examSubjectRepository.save(subject);
            return Result.success("上传成功", storedUrl);
        } catch (Exception e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    private boolean isAllowedPaperFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return ".jpg".equals(extension) || ".jpeg".equals(extension) || ".png".equals(extension) || ".pdf".equals(extension);
    }

    private String storeSubjectFile(InputStream inputStream, String classId, String subjectName, String type, String originalFilename) throws Exception {
        String storedName = type + "_" + System.currentTimeMillis() + "_" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8) + getFileExtension(originalFilename);
        String objectKey = "papers/exam-classes/" + safePathSegment(classId) + "/" +
                safePathSegment(subjectName) + "/" + storedName;
        return ossStorageService.upload(inputStream, -1, objectKey, resolveContentType(originalFilename));
    }

    private String safePathSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "unknown";
        }
        return value.trim().replaceAll("[\\\\/:*?\"<>|\\s]+", "_");
    }

    private String getFileExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return "";
        }
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index) : "";
    }

    private String resolveContentType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return switch (extension) {
            case ".png" -> "image/png";
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
    }
}
