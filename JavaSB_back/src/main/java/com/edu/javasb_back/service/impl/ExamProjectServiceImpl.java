package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import com.edu.javasb_back.model.entity.ExamClass;
import com.edu.javasb_back.model.entity.ExamProject;
import com.edu.javasb_back.model.entity.ExamStudentScore;
import com.edu.javasb_back.model.entity.ExamSubject;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamClassRepository;
import com.edu.javasb_back.repository.ExamProjectRepository;
import com.edu.javasb_back.repository.ExamStudentScoreRepository;
import com.edu.javasb_back.repository.ExamSubjectRepository;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.ExamProjectService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ExamProjectServiceImpl implements ExamProjectService {

    private static final String NORMAL = "NORMAL";
    private static final Set<String> STUDENT_NO_HEADERS = Set.of("学号", "考号", "准考证号", "学生学号", "studentno", "student_no", "studentid", "student_id");
    private static final Set<String> STUDENT_NAME_HEADERS = Set.of("姓名", "学生姓名", "name", "studentname", "student_name");
    private static final List<String> SUBJECT_OPTIONS = Arrays.asList(
            "语文", "数学", "英语", "物理", "化学", "生物", "政治", "历史", "地理",
            "信息技术", "体育", "科学", "通用技术", "音乐", "美术"
    );

    @Autowired private ExamProjectRepository examProjectRepository;
    @Autowired private ExamClassRepository examClassRepository;
    @Autowired private ExamSubjectRepository examSubjectRepository;
    @Autowired private ExamStudentScoreRepository examStudentScoreRepository;
    @Autowired private SysSchoolRepository sysSchoolRepository;
    @Autowired private SysClassRepository sysClassRepository;
    @Autowired private SysStudentRepository sysStudentRepository;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private GlobalConfigProperties globalConfigProperties;

    @Override
    public Result<Map<String, Object>> getProjectList(int current, int size, String name) {
        Pageable pageable = PageRequest.of(current - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Specification<ExamProject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(name)) predicates.add(cb.like(root.get("name"), "%" + name.trim() + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<ExamProject> page = examProjectRepository.findAll(spec, pageable);
        Map<String, Object> data = pageData(page.getContent().stream().map(this::projectBase).toList(), page.getTotalElements(), current, size);
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getProjectOptions() {
        List<SysSchool> schools = sysSchoolRepository.findByStatus(1);
        List<SysClass> classes = sysClassRepository.findAll(Sort.by("schoolId", "grade", "alias"));
        Map<String, SysSchool> schoolMap = schools.stream().collect(Collectors.toMap(SysSchool::getSchoolId, Function.identity(), (a, b) -> a));
        Map<String, Integer> studentCountMap = studentCountMap(classes.stream().map(SysClass::getClassid).toList());
        Map<String, Long> schoolClassCount = classes.stream().collect(Collectors.groupingBy(SysClass::getSchoolId, Collectors.counting()));
        Map<String, Integer> schoolStudentCount = new HashMap<>();
        for (SysClass sysClass : classes) schoolStudentCount.merge(sysClass.getSchoolId(), studentCountMap.getOrDefault(sysClass.getClassid(), 0), Integer::sum);

        List<Map<String, Object>> schoolOptions = schools.stream().map(school -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", school.getSchoolId());
            item.put("name", school.getName());
            item.put("province", school.getProvince());
            item.put("city", school.getCity());
            item.put("classCount", schoolClassCount.getOrDefault(school.getSchoolId(), 0L));
            item.put("studentCount", schoolStudentCount.getOrDefault(school.getSchoolId(), 0));
            item.put("label", str(school.getProvince()) + str(school.getCity()) + str(school.getName()));
            return item;
        }).toList();

        List<Map<String, Object>> classOptions = classes.stream().map(sysClass -> {
            SysSchool school = schoolMap.get(sysClass.getSchoolId());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", sysClass.getClassid());
            item.put("schoolId", sysClass.getSchoolId());
            item.put("schoolName", school == null ? "" : school.getName());
            item.put("grade", sysClass.getGrade());
            item.put("className", sysClass.getAlias());
            item.put("studentCount", studentCountMap.getOrDefault(sysClass.getClassid(), 0));
            item.put("label", (school == null ? "未知学校" : school.getName()) + " / " + str(sysClass.getGrade()) + " / " + str(sysClass.getAlias()));
            return item;
        }).toList();

        Map<String, Object> data = new HashMap<>();
        data.put("schools", schoolOptions);
        data.put("classes", classOptions);
        data.put("subjects", SUBJECT_OPTIONS);
        return Result.success("获取成功", data);
    }

    @Override
    @Transactional
    public Result<Void> addProject(ExamProjectSaveDTO dto) {
        Prepared prepared = prepare(dto);
        if (!prepared.ok()) return Result.error(prepared.msg());
        ExamProject project = new ExamProject();
        project.setId(id("EP"));
        saveProject(project, prepared);
        return Result.success("创建成功", null);
    }

    @Override
    @Transactional
    public Result<Void> updateProject(ExamProjectSaveDTO dto) {
        if (!StringUtils.hasText(dto.getId())) return Result.error("项目ID不能为空");
        ExamProject project = examProjectRepository.findById(dto.getId()).orElse(null);
        if (project == null) return Result.error("项目不存在");
        Prepared prepared = prepare(dto);
        if (!prepared.ok()) return Result.error(prepared.msg());
        saveProject(project, prepared);
        return Result.success("更新成功", null);
    }

    @Override
    @Transactional
    public Result<Void> deleteProject(String id) {
        if (!examProjectRepository.existsById(id)) return Result.error("项目不存在");
        examProjectRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @Override
    public Result<Map<String, Object>> getProjectDetail(String id) {
        ExamProject project = examProjectRepository.findById(id).orElse(null);
        if (project == null) return Result.error("项目不存在");
        Ctx ctx = ctx(id);
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> projectInfo = projectBase(project);
        projectInfo.put("selectedSchoolIds", list(project.getSelectedSchoolIds()));
        projectInfo.put("selectedClassIds", list(project.getSelectedClassIds()));
        data.put("project", projectInfo);
        data.put("benchmarks", map(project.getSubjectBenchmarks()));
        data.put("stats", Map.of(
                "schoolCount", num(project.getSchoolCount()),
                "classCount", num(project.getClassCount()),
                "studentCount", num(project.getStudentCount()),
                "subjectCount", num(project.getSubjectCount()),
                "scoreRecordCount", scoreRecordCount(ctx.scores()),
                "paperRecordCount", paperRecordCount(ctx.scores())
        ));
        data.put("classes", ctx.examClasses().stream().map(this::classItem).toList());
        data.put("subjects", scoreSummaryRows(ctx));
        data.put("schools", ctx.examClasses().stream().collect(Collectors.groupingBy(ExamClass::getSchoolId, LinkedHashMap::new, Collectors.toList()))
                .values().stream().map(items -> {
                    Map<String, Object> school = new LinkedHashMap<>();
                    school.put("schoolId", items.get(0).getSchoolId());
                    school.put("schoolName", items.get(0).getSchool());
                    school.put("classCount", items.size());
                    school.put("studentCount", items.stream().mapToInt(it -> num(it.getStudentCount())).sum());
                    return school;
                }).toList());
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getProjectStudentPage(String projectId, int current, int size, String keyword, String schoolId, String classId) {
        ExamProject project = examProjectRepository.findById(projectId).orElse(null);
        if (project == null) return Result.error("项目不存在");
        Ctx ctx = ctx(projectId);
        int subjectCount = num(project.getSubjectCount());
        List<Map<String, Object>> rows = ctx.students().stream()
                .filter(student -> studentMatch(student, keyword, schoolId, classId))
                .sorted(Comparator.comparing(SysStudent::getSchool, Comparator.nullsLast(String::compareTo))
                        .thenComparing(SysStudent::getGrade, Comparator.nullsLast(String::compareTo))
                        .thenComparing(SysStudent::getClassName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(SysStudent::getName, Comparator.nullsLast(String::compareTo)))
                .map(student -> {
                    int done = ctx.doneMap().getOrDefault(student.getStudentNo(), 0);
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", student.getId());
                    item.put("studentNo", student.getStudentNo());
                    item.put("studentName", student.getName());
                    item.put("schoolId", student.getSchoolId());
                    item.put("school", student.getSchool());
                    item.put("grade", student.getGrade());
                    item.put("classId", student.getClassId());
                    item.put("className", student.getClassName());
                    item.put("completedSubjectCount", done);
                    item.put("subjectCount", subjectCount);
                    item.put("status", done <= 0 ? "待录入" : done < subjectCount ? "录入中" : "已完成");
                    return item;
                }).toList();
        long completed = ctx.doneMap().values().stream().filter(v -> v >= subjectCount).count();
        Map<String, Object> data = pageData(page(rows, current, size), rows.size(), current, size);
        data.put("stats", Map.of(
                "schoolCount", num(project.getSchoolCount()),
                "classCount", num(project.getClassCount()),
                "studentCount", num(project.getStudentCount()),
                "completedCount", completed,
                "pendingCount", Math.max(num(project.getStudentCount()) - (int) completed, 0)
        ));
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getProjectScoreSummary(String projectId) {
        ExamProject project = examProjectRepository.findById(projectId).orElse(null);
        if (project == null) return Result.error("项目不存在");
        Ctx ctx = ctx(projectId);
        List<Map<String, Object>> rows = scoreSummaryRows(ctx);
        long uploaded = rows.stream().filter(item -> Boolean.TRUE.equals(item.get("scoreUploaded"))).count();
        Map<String, Object> data = new HashMap<>();
        data.put("records", rows);
        data.put("stats", Map.of(
                "subjectCount", num(project.getSubjectCount()),
                "uploadedSubjectCount", uploaded,
                "scoreRecordCount", scoreRecordCount(ctx.scores()),
                "paperRecordCount", paperRecordCount(ctx.scores()),
                "studentCount", num(project.getStudentCount())
        ));
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getProjectScorePage(String projectId, String subjectName, int current, int size, String keyword, String schoolId, String classId) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        Ctx ctx = ctx(projectId);
        
        // Find subject IDs for the given subjectName across all classes in the project
        Map<String, String> classIdToSubjectId = ctx.subjects().stream()
                .filter(s -> !StringUtils.hasText(subjectName) || subjectName.equals(s.getSubjectName()))
                .collect(Collectors.toMap(ExamSubject::getClassId, ExamSubject::getId, (a, b) -> a));

        // Map scores by subjectId and studentNo for quick lookup
        Map<String, ExamStudentScore> scoreMap = ctx.scores().stream()
                .collect(Collectors.toMap(s -> s.getSubjectId() + "_" + s.getStudentNo(), s -> s, (a, b) -> a));

        List<Map<String, Object>> rows = ctx.students().stream()
                .map(student -> {
                    // Find the ExamClass this student belongs to in this project
                    ExamClass examClass = ctx.examClasses().stream()
                            .filter(ec -> ec.getSourceClassId().equals(student.getClassId()))
                            .findFirst().orElse(null);
                    
                    if (examClass == null) return null;
                    
                    String subjectId = classIdToSubjectId.get(examClass.getId());
                    if (subjectId == null) return null;

                    ExamStudentScore score = scoreMap.get(subjectId + "_" + student.getStudentNo());
                    
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", score != null ? score.getId() : null);
                    item.put("subjectName", subjectName);
                    item.put("studentNo", student.getStudentNo());
                    item.put("studentName", student.getName());
                    item.put("schoolId", student.getSchoolId());
                    item.put("school", student.getSchool());
                    item.put("grade", student.getGrade());
                    item.put("classId", student.getClassId());
                    item.put("className", student.getClassName());
                    item.put("totalScore", hasScore(score) ? score.getTotalScore() : null);
                    item.put("questionScores", score == null ? "[]" : score.getQuestionScores());
                    item.put("hasScore", hasScore(score));
                    item.put("hasAnswerSheet", hasAnswerSheet(score));
                    item.put("answerSheetUrl", score == null ? null : score.getAnswerSheetUrl());
                    item.put("updateTime", score != null ? score.getUpdateTime() : null);
                    return item;
                })
                .filter(java.util.Objects::nonNull)
                .filter(item -> scoreMatch(item, keyword, schoolId, classId))
                .sorted(Comparator.comparing((Map<String, Object> item) -> {
                    Object score = item.get("totalScore");
                    return score != null ? ((Number) score).doubleValue() : -1.0;
                }).reversed())
                .toList();

        return Result.success("获取成功", pageData(page(rows, current, size), rows.size(), current, size));
    }

    @Override
    public void downloadScoreTemplate(HttpServletResponse response) {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("成绩导入模板", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            ClassPathResource resource = new ClassPathResource("assests/成绩导入模板.xlsx");
            if (!resource.exists()) {
                // If it's not in resources, try the direct path from working directory
                java.io.File file = new java.io.File("c:\\Users\\admin\\Desktop\\wechat_mini_program-master\\JavaSB_back\\src\\main\\assests\\成绩导入模板.xlsx");
                if (file.exists()) {
                    try (InputStream is = new java.io.FileInputStream(file);
                         OutputStream os = response.getOutputStream()) {
                        byte[] buffer = new byte[4096];
                        int bytesRead;
                        while ((bytesRead = is.read(buffer)) != -1) {
                            os.write(buffer, 0, bytesRead);
                        }
                        os.flush();
                        return;
                    }
                }
            }

            try (InputStream is = resource.getInputStream();
                 OutputStream os = response.getOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                os.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public Result<Void> importScores(String projectId, String subjectName, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (file == null || file.isEmpty()) return Result.error("请上传成绩文件");
        Ctx ctx = ctx(projectId);

        Map<String, ExamSubject> classToSubjectMap = ctx.subjects().stream()
                .filter(s -> subjectName.equals(s.getSubjectName()))
                .collect(Collectors.toMap(ExamSubject::getClassId, Function.identity(), (a, b) -> a));
        if (classToSubjectMap.isEmpty()) return Result.error("项目中不存在学科: " + subjectName);

        Map<String, ExamClass> examClassMap = ctx.examClasses().stream()
                .filter(item -> StringUtils.hasText(item.getSourceClassId()))
                .collect(Collectors.toMap(ExamClass::getSourceClassId, Function.identity(), (a, b) -> a));
        if (examClassMap.isEmpty()) return Result.error("项目中暂无考试班级数据");

        Map<String, SysStudent> studentNoMap = new HashMap<>();
        Map<String, List<SysStudent>> studentNameMap = new HashMap<>();
        for (SysStudent student : ctx.students()) {
            if (StringUtils.hasText(student.getStudentNo())) {
                studentNoMap.put(normalizeStudentNo(student.getStudentNo()), student);
            }
            if (StringUtils.hasText(student.getName())) {
                studentNameMap.computeIfAbsent(normalizeStudentName(student.getName()), key -> new ArrayList<>()).add(student);
            }
        }
        if (studentNoMap.isEmpty() && studentNameMap.isEmpty()) return Result.error("该项目中暂无考试学生数据");

        List<String> logs = new ArrayList<>();
        List<ExamStudentScore> scoresToSave = new ArrayList<>();
        Set<String> updatedSubjectIds = new LinkedHashSet<>();
        Set<String> importedScoreKeys = new LinkedHashSet<>();
        Set<String> subjectIds = classToSubjectMap.values().stream().map(ExamSubject::getId).collect(Collectors.toSet());
        Map<String, ExamStudentScore> existingScoreMap = ctx.scores().stream()
                .filter(score -> subjectIds.contains(score.getSubjectId()))
                .collect(Collectors.toMap(
                        score -> score.getSubjectId() + "_" + score.getStudentNo(),
                        Function.identity(),
                        (a, b) -> b
                ));

        int rowCount = 0;
        int skipCount = 0;
        int errorCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return Result.error("Excel中没有可读取的工作表");

            DataFormatter formatter = new DataFormatter();
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            int headerRowIndex = sheet.getFirstRowNum();
            Row headerRow = sheet.getRow(headerRowIndex);
            if (headerRow == null) return Result.error("Excel第一行不能为空");

            String identifierHeader = normalizeHeader(readCellAsString(headerRow.getCell(0), formatter, evaluator));
            if (!StringUtils.hasText(identifierHeader)) {
                return Result.error("Excel第一行第1列不能为空，请填写“学号”或“姓名”");
            }

            StudentIdentifierType identifierType = resolveIdentifierType(identifierHeader);
            if (identifierType == null) {
                return Result.error("Excel第一列标题仅支持“学号”或“姓名”");
            }

            int lastScoreColumnIndex = findLastNonEmptyCellIndex(headerRow, formatter, evaluator);
            if (lastScoreColumnIndex < 1) {
                return Result.error("Excel至少需要1列学生标识和1列小题分");
            }

            List<Integer> scoreColumnIndexes = new ArrayList<>();
            for (int colIndex = 1; colIndex <= lastScoreColumnIndex; colIndex++) {
                String headerValue = readCellAsString(headerRow.getCell(colIndex), formatter, evaluator).trim();
                if (!StringUtils.hasText(headerValue)) {
                    return Result.error("Excel第一行第" + (colIndex + 1) + "列不能为空");
                }
                scoreColumnIndexes.add(colIndex);
            }

            int lastRowNum = sheet.getLastRowNum();
            for (int rowIndex = headerRowIndex + 1; rowIndex <= lastRowNum; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isBlankRow(row, lastScoreColumnIndex, formatter, evaluator)) {
                    skipCount++;
                    continue;
                }

                String identifierRaw = readCellAsString(row.getCell(0), formatter, evaluator).trim();
                if (!StringUtils.hasText(identifierRaw)) {
                    logs.add("第" + (rowIndex + 1) + "行第1列不能为空");
                    errorCount++;
                    continue;
                }

                StudentMatch studentMatch = matchStudent(identifierType, identifierRaw, studentNoMap, studentNameMap);
                if (!studentMatch.ok()) {
                    logs.add("第" + (rowIndex + 1) + "行: " + studentMatch.msg());
                    if (studentMatch.skipped()) skipCount++;
                    else errorCount++;
                    continue;
                }
                SysStudent student = studentMatch.student();

                ExamClass examClass = examClassMap.get(student.getClassId());
                if (examClass == null) {
                    logs.add("第" + (rowIndex + 1) + "行: 学生[" + identifierRaw + "]未在当前考试项目的班级名单中");
                    skipCount++;
                    continue;
                }

                ExamSubject subject = classToSubjectMap.get(examClass.getId());
                if (subject == null) {
                    logs.add("第" + (rowIndex + 1) + "行: 学生[" + identifierRaw + "]所属班级未开启[" + subjectName + "]科目");
                    skipCount++;
                    continue;
                }

                String scoreKey = subject.getId() + "_" + student.getStudentNo();
                if (!importedScoreKeys.add(scoreKey)) {
                    logs.add("第" + (rowIndex + 1) + "行: 学生[" + identifierRaw + "]在当前文件中重复出现");
                    errorCount++;
                    continue;
                }

                List<Double> questionScores = new ArrayList<>();
                double total = 0;
                boolean rowHasError = false;

                for (Integer colIndex : scoreColumnIndexes) {
                    String scoreStr = readCellAsString(row.getCell(colIndex), formatter, evaluator).trim();
                    if (!StringUtils.hasText(scoreStr)) {
                        logs.add("第" + (rowIndex + 1) + "行第" + (colIndex + 1) + "列不能为空");
                        rowHasError = true;
                        break;
                    }
                    try {
                        double questionScore = Double.parseDouble(scoreStr.replace(",", ""));
                        questionScores.add(questionScore);
                        total += questionScore;
                    } catch (NumberFormatException e) {
                        logs.add("第" + (rowIndex + 1) + "行第" + (colIndex + 1) + "列成绩[" + scoreStr + "]格式错误");
                        rowHasError = true;
                        break;
                    }
                }

                if (rowHasError) {
                    errorCount++;
                    continue;
                }

                ExamStudentScore score = prepareScoreRecord(existingScoreMap.get(scoreKey), subject, student);
                score.setTotalScore(total);
                score.setScoreEntered(Boolean.TRUE);
                try {
                    score.setQuestionScores(objectMapper.writeValueAsString(questionScores));
                } catch (Exception ignored) {}
                scoresToSave.add(score);
                existingScoreMap.put(scoreKey, score);
                updatedSubjectIds.add(subject.getId());
                rowCount++;
            }
        } catch (Exception e) {
            return Result.error("文件读取失败: " + e.getMessage());
        }

        if (rowCount <= 0) {
            String summary = String.format("导入失败: 成功 %d 条, 跳过 %d 条, 错误 %d 条", rowCount, skipCount, errorCount);
            if (!logs.isEmpty()) {
                String detail = logs.stream().limit(5).collect(Collectors.joining("; "));
                if (logs.size() > 5) detail += "...等" + logs.size() + "条提示";
                return Result.error(summary + ". 提示: " + detail);
            }
            return Result.error(summary);
        }

        if (!scoresToSave.isEmpty()) {
            examStudentScoreRepository.saveAllAndFlush(scoresToSave);
        }
        if (!updatedSubjectIds.isEmpty()) {
            List<ExamSubject> subjectsToUpdate = classToSubjectMap.values().stream()
                    .filter(subject -> updatedSubjectIds.contains(subject.getId()))
                    .peek(subject -> subject.setScoreUploaded(Boolean.TRUE))
                    .toList();
            if (!subjectsToUpdate.isEmpty()) {
                examSubjectRepository.saveAllAndFlush(subjectsToUpdate);
            }
        }

        String summary = String.format("导入完成: 成功 %d 条, 跳过 %d 条, 错误 %d 条", rowCount, skipCount, errorCount);
        if (!logs.isEmpty()) {
            String detail = logs.stream().limit(5).collect(Collectors.joining("; "));
            if (logs.size() > 5) detail += "...等" + logs.size() + "条提示";
            return Result.success(summary + ". 提示: " + detail, null);
        }
        
        return Result.success(summary, null);
    }

    @Override
    @Transactional
    public Result<Void> importAnswerSheets(String projectId, String subjectName, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (file == null || file.isEmpty()) return Result.error("请上传试卷压缩包");

        String originalFilename = file.getOriginalFilename();
        if (!isZipFile(originalFilename)) {
            return Result.error("试卷批量导入仅支持 .zip 压缩包");
        }

        UploadCtx uploadCtx = buildUploadCtx(projectId, subjectName);
        if (!uploadCtx.ok()) return Result.error(uploadCtx.msg());

        List<String> logs = new ArrayList<>();
        List<ExamStudentScore> scoresToSave = new ArrayList<>();
        Set<String> importedKeys = new LinkedHashSet<>();
        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;

        try (ZipInputStream zipInputStream = new ZipInputStream(file.getInputStream(), StandardCharsets.UTF_8)) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    zipInputStream.closeEntry();
                    continue;
                }

                String entryName = Paths.get(entry.getName()).getFileName().toString();
                if (!StringUtils.hasText(entryName) || entryName.startsWith(".")) {
                    zipInputStream.closeEntry();
                    continue;
                }
                if (entryName.startsWith("__MACOSX")) {
                    zipInputStream.closeEntry();
                    continue;
                }
                if (!isAllowedPaperFile(entryName)) {
                    logs.add("文件[" + entryName + "]格式不支持，仅支持 jpg/jpeg/png/pdf");
                    skipCount++;
                    zipInputStream.closeEntry();
                    continue;
                }

                FileMatch fileMatch = matchStudentByPaperFileName(entryName, uploadCtx.studentNoMap(), uploadCtx.studentNameMap());
                if (!fileMatch.ok()) {
                    logs.add("文件[" + entryName + "]: " + fileMatch.msg());
                    if (fileMatch.skipped()) skipCount++;
                    else errorCount++;
                    zipInputStream.closeEntry();
                    continue;
                }

                SysStudent student = fileMatch.student();
                ExamClass examClass = uploadCtx.examClassMap().get(student.getClassId());
                if (examClass == null) {
                    logs.add("文件[" + entryName + "]: 学生[" + student.getName() + "]未在当前考试项目班级中");
                    skipCount++;
                    zipInputStream.closeEntry();
                    continue;
                }

                ExamSubject subject = uploadCtx.classToSubjectMap().get(examClass.getId());
                if (subject == null) {
                    logs.add("文件[" + entryName + "]: 学生[" + student.getName() + "]所属班级未开启[" + subjectName + "]科目");
                    skipCount++;
                    zipInputStream.closeEntry();
                    continue;
                }

                String scoreKey = subject.getId() + "_" + student.getStudentNo();
                if (!importedKeys.add(scoreKey)) {
                    logs.add("文件[" + entryName + "]: 当前压缩包内重复上传了同一学生试卷");
                    errorCount++;
                    zipInputStream.closeEntry();
                    continue;
                }

                String storedUrl = storePaperFile(zipInputStream, projectId, subjectName, student.getStudentNo(), entryName);
                ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), subject, student);
                score.setAnswerSheetUrl(storedUrl);
                scoresToSave.add(score);
                uploadCtx.existingScoreMap().put(scoreKey, score);
                successCount++;
                zipInputStream.closeEntry();
            }
        } catch (Exception e) {
            return Result.error("试卷压缩包处理失败: " + e.getMessage());
        }

        if (!scoresToSave.isEmpty()) {
            examStudentScoreRepository.saveAllAndFlush(scoresToSave);
        }

        String summary = String.format("试卷导入完成: 成功 %d 条, 跳过 %d 条, 错误 %d 条", successCount, skipCount, errorCount);
        if (successCount <= 0) {
            if (!logs.isEmpty()) {
                String detail = logs.stream().limit(5).collect(Collectors.joining("; "));
                if (logs.size() > 5) detail += "...等" + logs.size() + "条提示";
                return Result.error(summary + ". 提示: " + detail);
            }
            return Result.error(summary);
        }
        if (!logs.isEmpty()) {
            String detail = logs.stream().limit(5).collect(Collectors.joining("; "));
            if (logs.size() > 5) detail += "...等" + logs.size() + "条提示";
            return Result.success(summary + ". 提示: " + detail, null);
        }
        return Result.success(summary, null);
    }

    @Override
    @Transactional
    public Result<String> uploadAnswerSheet(String projectId, String subjectName, String studentNo, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (!StringUtils.hasText(studentNo)) return Result.error("学生学号不能为空");
        if (file == null || file.isEmpty()) return Result.error("请上传试卷文件");

        String originalFilename = file.getOriginalFilename();
        if (!isAllowedPaperFile(originalFilename)) {
            return Result.error("仅支持上传 jpg/jpeg/png/pdf 格式试卷");
        }

        UploadCtx uploadCtx = buildUploadCtx(projectId, subjectName);
        if (!uploadCtx.ok()) return Result.error(uploadCtx.msg());

        SysStudent student = uploadCtx.studentNoMap().get(normalizeStudentNo(studentNo));
        if (student == null) return Result.error("该学生不在当前考试项目名单中");

        ExamClass examClass = uploadCtx.examClassMap().get(student.getClassId());
        if (examClass == null) return Result.error("该学生所在班级未纳入当前考试项目");

        ExamSubject subject = uploadCtx.classToSubjectMap().get(examClass.getId());
        if (subject == null) return Result.error("该学生所在班级未开启当前学科");

        String scoreKey = subject.getId() + "_" + student.getStudentNo();
        try {
            String storedUrl = storePaperFile(file.getInputStream(), projectId, subjectName, student.getStudentNo(), originalFilename);
            ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), subject, student);
            score.setAnswerSheetUrl(storedUrl);
            examStudentScoreRepository.saveAndFlush(score);
            return Result.success("试卷上传成功", storedUrl);
        } catch (Exception e) {
            return Result.error("试卷上传失败: " + e.getMessage());
        }
    }

    private void saveProject(ExamProject project, Prepared prepared) {
        project.setName(prepared.name());
        project.setExamType(NORMAL);
        project.setSelectedSchoolIds(json(prepared.selectedSchoolIds()));
        project.setSelectedClassIds(json(prepared.selectedClassIds()));
        project.setSubjectNames(json(prepared.subjects()));
        project.setSubjectBenchmarks(jsonMap(prepared.benchmarks()));
        project.setSchoolCount(prepared.coveredSchoolIds().size());
        project.setClassCount(prepared.classes().size());
        project.setStudentCount(prepared.classes().stream().mapToInt(c -> prepared.studentCountMap().getOrDefault(c.getClassid(), 0)).sum());
        project.setSubjectCount(prepared.subjects().size());
        examProjectRepository.save(project);

        examClassRepository.deleteByProjectId(project.getId());
        Map<String, String> schoolNameMap = sysSchoolRepository.findBySchoolIdIn(prepared.coveredSchoolIds()).stream()
                .collect(Collectors.toMap(SysSchool::getSchoolId, SysSchool::getName, (a, b) -> a));
        List<ExamClass> examClasses = prepared.classes().stream().map(sysClass -> {
            ExamClass item = new ExamClass();
            item.setId(id("EC"));
            item.setProjectId(project.getId());
            item.setSchoolId(sysClass.getSchoolId());
            item.setSchool(schoolNameMap.getOrDefault(sysClass.getSchoolId(), ""));
            item.setGrade(sysClass.getGrade());
            item.setClassName(sysClass.getAlias());
            item.setSourceClassId(sysClass.getClassid());
            item.setStudentCount(prepared.studentCountMap().getOrDefault(sysClass.getClassid(), 0));
            return item;
        }).toList();
        List<ExamClass> savedClasses = examClassRepository.saveAll(examClasses);
        List<ExamSubject> subjects = new ArrayList<>();
        for (ExamClass examClass : savedClasses) {
            for (String subjectName : prepared.subjects()) {
                ExamSubject subject = new ExamSubject();
                subject.setId(id("ES"));
                subject.setClassId(examClass.getId());
                subject.setSubjectName(subjectName);
                subject.setScoreUploaded(Boolean.FALSE);
                subjects.add(subject);
            }
        }
        examSubjectRepository.saveAll(subjects);
    }

    private Prepared prepare(ExamProjectSaveDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getName())) return Prepared.fail("考试项目名称不能为空");
        List<String> subjects = normalize(dto.getSubjects());
        if (subjects.isEmpty()) return Prepared.fail("请至少选择一个科目");

        List<String> selectedSchoolIds = normalize(dto.getSchoolIds());
        List<String> selectedClassIds = normalize(dto.getClassIds());
        if (selectedSchoolIds.isEmpty() && selectedClassIds.isEmpty()) {
            return Prepared.fail("请至少选择一个学校或班级");
        }

        List<SysClass> classes = new ArrayList<>();
        if (!selectedSchoolIds.isEmpty()) {
            classes.addAll(sysClassRepository.findBySchoolIdIn(selectedSchoolIds));
        }
        if (!selectedClassIds.isEmpty()) {
            classes.addAll(sysClassRepository.findByClassidIn(selectedClassIds));
        }
        if (classes.isEmpty()) return Prepared.fail("未找到可纳入考试的班级");

        Map<String, SysClass> classMap = new LinkedHashMap<>();
        for (SysClass item : classes) {
            if (item != null && StringUtils.hasText(item.getClassid())) {
                classMap.put(item.getClassid(), item);
            }
        }
        List<SysClass> resolvedClasses = classMap.values().stream()
                .sorted(Comparator.comparing(SysClass::getSchoolId).thenComparing(SysClass::getGrade).thenComparing(SysClass::getAlias))
                .toList();
        List<String> resolvedClassIds = resolvedClasses.stream().map(SysClass::getClassid).toList();
        List<String> coveredSchoolIds = resolvedClasses.stream().map(SysClass::getSchoolId).filter(StringUtils::hasText).distinct().toList();

        return new Prepared(
                true,
                "",
                dto.getName().trim(),
                selectedSchoolIds,
                selectedClassIds,
                coveredSchoolIds,
                resolvedClasses,
                subjects,
                studentCountMap(resolvedClassIds),
                dto.getBenchmarks()
        );
    }

    private Ctx ctx(String projectId) {
        List<ExamClass> examClasses = examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(projectId);
        List<String> examClassIds = examClasses.stream().map(ExamClass::getId).toList();
        List<ExamSubject> subjects = examClassIds.isEmpty() ? Collections.emptyList() : examSubjectRepository.findByClassIdInOrderBySubjectNameAsc(examClassIds);
        List<String> sourceClassIds = examClasses.stream().map(ExamClass::getSourceClassId).filter(StringUtils::hasText).distinct().toList();
        List<SysStudent> students = sourceClassIds.isEmpty() ? Collections.emptyList() : sysStudentRepository.findByClassIdIn(sourceClassIds);
        List<String> subjectIds = subjects.stream().map(ExamSubject::getId).toList();
        List<ExamStudentScore> scores = subjectIds.isEmpty() ? Collections.emptyList() : examStudentScoreRepository.findBySubjectIdIn(subjectIds);
        Map<String, Set<String>> studentSubjectSet = new HashMap<>();
        for (ExamStudentScore score : scores) {
            if (hasScore(score)) {
                studentSubjectSet.computeIfAbsent(score.getStudentNo(), key -> new LinkedHashSet<>()).add(score.getSubjectId());
            }
        }
        Map<String, Integer> doneMap = new HashMap<>();
        studentSubjectSet.forEach((key, value) -> doneMap.put(key, value.size()));
        return new Ctx(
                examClasses,
                subjects,
                students,
                scores,
                examClasses.stream().collect(Collectors.toMap(ExamClass::getId, Function.identity(), (a, b) -> a)),
                subjects.stream().collect(Collectors.toMap(ExamSubject::getId, Function.identity(), (a, b) -> a)),
                doneMap
        );
    }

    private List<Map<String, Object>> scoreSummaryRows(Ctx ctx) {
        return ctx.subjects().stream().collect(Collectors.groupingBy(ExamSubject::getSubjectName, LinkedHashMap::new, Collectors.toList()))
                .entrySet().stream().map(entry -> {
                    Set<String> classIds = entry.getValue().stream().map(ExamSubject::getClassId).collect(Collectors.toSet());
                    Set<String> subjectIds = entry.getValue().stream().map(ExamSubject::getId).collect(Collectors.toSet());
                    List<ExamStudentScore> scoreRecords = ctx.scores().stream()
                            .filter(score -> subjectIds.contains(score.getSubjectId()) && hasScore(score))
                            .toList();
                    long paperCount = ctx.scores().stream()
                            .filter(score -> subjectIds.contains(score.getSubjectId()) && hasAnswerSheet(score))
                            .count();
                    int studentCount = classIds.stream().map(ctx.classMap()::get).filter(v -> v != null).mapToInt(v -> num(v.getStudentCount())).sum();
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("subjectName", entry.getKey());
                    item.put("classCount", classIds.size());
                    item.put("studentCount", studentCount);
                    item.put("paperCount", paperCount);
                    item.put("scoreCount", scoreRecords.size());
                    item.put("avgScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).average().orElse(0)));
                    item.put("maxScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).max().orElse(0)));
                    item.put("minScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).min().orElse(0)));
                    item.put("paperUploaded", studentCount > 0 && paperCount >= studentCount);
                    item.put("scoreUploaded", studentCount > 0 && scoreRecords.size() >= studentCount);
                    return item;
                }).toList();
    }

    private Map<String, Object> scoreItem(ExamStudentScore score, Ctx ctx) {
        ExamSubject subject = ctx.subjectMap().get(score.getSubjectId());
        ExamClass examClass = subject == null ? null : ctx.classMap().get(subject.getClassId());
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", score.getId());
        item.put("subjectName", subject == null ? "" : subject.getSubjectName());
        item.put("studentNo", score.getStudentNo());
        item.put("studentName", score.getStudentName());
        item.put("schoolId", examClass == null ? "" : examClass.getSchoolId());
        item.put("school", examClass == null ? "" : examClass.getSchool());
        item.put("grade", examClass == null ? "" : examClass.getGrade());
        item.put("classId", examClass == null ? "" : examClass.getSourceClassId());
        item.put("className", examClass == null ? "" : examClass.getClassName());
        item.put("hasAnswerSheet", hasAnswerSheet(score));
        item.put("answerSheetUrl", score.getAnswerSheetUrl());
        item.put("hasScore", hasScore(score));
        item.put("totalScore", hasScore(score) ? dbl(score.getTotalScore()) : null);
        item.put("updateTime", score.getUpdateTime());
        return item;
    }

    private Map<String, Object> projectBase(ExamProject project) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(project.getId()));
        item.put("name", str(project.getName()));
        item.put("examType", str(project.getExamType()));
        item.put("examTypeLabel", "统一考试");
        item.put("schoolCount", num(project.getSchoolCount()));
        item.put("classCount", num(project.getClassCount()));
        item.put("studentCount", num(project.getStudentCount()));
        item.put("subjectCount", num(project.getSubjectCount()));
        item.put("subjects", list(project.getSubjectNames()));
        item.put("createTime", project.getCreateTime());
        item.put("updateTime", project.getUpdateTime());
        return item;
    }

    private Map<String, Object> classItem(ExamClass examClass) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", examClass.getId());
        item.put("projectId", examClass.getProjectId());
        item.put("schoolId", examClass.getSchoolId());
        item.put("school", examClass.getSchool());
        item.put("grade", examClass.getGrade());
        item.put("className", examClass.getClassName());
        item.put("sourceClassId", examClass.getSourceClassId());
        item.put("studentCount", num(examClass.getStudentCount()));
        return item;
    }

    private boolean studentMatch(SysStudent student, String keyword, String schoolId, String classId) {
        if (StringUtils.hasText(keyword)) {
            String v = keyword.trim();
            boolean hit = contains(student.getStudentNo(), v) || contains(student.getName(), v) || contains(student.getSchool(), v) || contains(student.getClassName(), v);
            if (!hit) return false;
        }
        if (StringUtils.hasText(schoolId) && !schoolId.equals(student.getSchoolId())) return false;
        return !StringUtils.hasText(classId) || classId.equals(student.getClassId());
    }

    private boolean scoreMatch(Map<String, Object> item, String keyword, String schoolId, String classId) {
        if (StringUtils.hasText(keyword)) {
            String v = keyword.trim();
            boolean hit = contains(String.valueOf(item.get("studentNo")), v) || contains(String.valueOf(item.get("studentName")), v);
            if (!hit) return false;
        }
        if (StringUtils.hasText(schoolId) && !schoolId.equals(item.get("schoolId"))) return false;
        return !StringUtils.hasText(classId) || classId.equals(item.get("classId"));
    }

    private UploadCtx buildUploadCtx(String projectId, String subjectName) {
        Ctx ctx = ctx(projectId);
        Map<String, ExamSubject> classToSubjectMap = ctx.subjects().stream()
                .filter(subject -> subjectName.equals(subject.getSubjectName()))
                .collect(Collectors.toMap(ExamSubject::getClassId, Function.identity(), (a, b) -> a));
        if (classToSubjectMap.isEmpty()) {
            return UploadCtx.fail("项目中不存在学科: " + subjectName);
        }

        Map<String, ExamClass> examClassMap = ctx.examClasses().stream()
                .filter(item -> StringUtils.hasText(item.getSourceClassId()))
                .collect(Collectors.toMap(ExamClass::getSourceClassId, Function.identity(), (a, b) -> a));
        if (examClassMap.isEmpty()) {
            return UploadCtx.fail("项目中暂无考试班级数据");
        }

        Map<String, SysStudent> studentNoMap = new HashMap<>();
        Map<String, List<SysStudent>> studentNameMap = new HashMap<>();
        for (SysStudent student : ctx.students()) {
            if (StringUtils.hasText(student.getStudentNo())) {
                studentNoMap.put(normalizeStudentNo(student.getStudentNo()), student);
            }
            if (StringUtils.hasText(student.getName())) {
                studentNameMap.computeIfAbsent(normalizeStudentName(student.getName()), key -> new ArrayList<>()).add(student);
            }
        }
        if (studentNoMap.isEmpty() && studentNameMap.isEmpty()) {
            return UploadCtx.fail("该项目中暂无考试学生数据");
        }

        Set<String> subjectIds = classToSubjectMap.values().stream().map(ExamSubject::getId).collect(Collectors.toSet());
        Map<String, ExamStudentScore> existingScoreMap = ctx.scores().stream()
                .filter(score -> subjectIds.contains(score.getSubjectId()))
                .collect(Collectors.toMap(
                        score -> score.getSubjectId() + "_" + score.getStudentNo(),
                        Function.identity(),
                        (a, b) -> b
                ));
        return UploadCtx.ok(classToSubjectMap, examClassMap, studentNoMap, studentNameMap, existingScoreMap);
    }

    private ExamStudentScore prepareScoreRecord(ExamStudentScore existing, ExamSubject subject, SysStudent student) {
        ExamStudentScore score = existing == null ? new ExamStudentScore() : existing;
        score.setSubjectId(subject.getId());
        score.setStudentNo(student.getStudentNo());
        score.setStudentName(student.getName());
        if (score.getScoreEntered() == null) {
            score.setScoreEntered(Boolean.FALSE);
        }
        if (score.getTotalScore() == null) {
            score.setTotalScore(0D);
        }
        return score;
    }

    private FileMatch matchStudentByPaperFileName(
            String entryName,
            Map<String, SysStudent> studentNoMap,
            Map<String, List<SysStudent>> studentNameMap) {
        String baseName = entryName;
        int dotIndex = baseName.lastIndexOf('.');
        if (dotIndex > 0) {
            baseName = baseName.substring(0, dotIndex);
        }
        baseName = baseName.trim();
        if (!StringUtils.hasText(baseName)) {
            return FileMatch.skip("文件名不能为空");
        }

        List<String> candidates = Arrays.stream(baseName.split("_"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();

        if (candidates.size() >= 2) {
            String studentNo = candidates.get(0);
            String studentName = String.join("", candidates.subList(1, candidates.size()));
            FileMatch byNo = matchByStudentNo(studentNo, studentNoMap);
            FileMatch byName = matchByStudentName(studentName, studentNameMap);
            if (byNo.ok() && byName.ok() && !byNo.student().getStudentNo().equals(byName.student().getStudentNo())) {
                return FileMatch.error("学号和姓名匹配到不同学生，请检查命名格式");
            }
            if (byNo.ok()) return byNo;
            if (byName.ok()) return byName;
            if (!byNo.skipped()) return byNo;
            if (!byName.skipped()) return byName;
            return FileMatch.skip("未匹配到当前项目学生");
        }

        String identifier = candidates.get(0);
        FileMatch byNo = matchByStudentNo(identifier, studentNoMap);
        if (byNo.ok()) return byNo;
        if (!byNo.skipped()) return byNo;

        FileMatch byName = matchByStudentName(identifier, studentNameMap);
        if (byName.ok()) return byName;
        if (!byName.skipped()) return byName;
        return FileMatch.skip("未匹配到当前项目学生");
    }

    private FileMatch matchByStudentNo(String studentNo, Map<String, SysStudent> studentNoMap) {
        if (!StringUtils.hasText(studentNo)) return FileMatch.skip("学号为空");
        SysStudent student = studentNoMap.get(normalizeStudentNo(studentNo));
        return student == null ? FileMatch.skip("学号[" + studentNo + "]未在当前项目名单中") : FileMatch.ok(student);
    }

    private FileMatch matchByStudentName(String studentName, Map<String, List<SysStudent>> studentNameMap) {
        if (!StringUtils.hasText(studentName)) return FileMatch.skip("姓名为空");
        List<SysStudent> students = studentNameMap.getOrDefault(normalizeStudentName(studentName), Collections.emptyList());
        if (students.isEmpty()) return FileMatch.skip("姓名[" + studentName + "]未在当前项目名单中");
        if (students.size() > 1) return FileMatch.error("姓名[" + studentName + "]匹配到多名学生，请在文件名中补充学号");
        return FileMatch.ok(students.get(0));
    }

    private String storePaperFile(InputStream inputStream, String projectId, String subjectName, String studentNo, String originalFilename) throws Exception {
        String extension = getFileExtension(originalFilename);
        Path baseDir = Paths.get(globalConfigProperties.getPaperDir())
                .resolve("exam-projects")
                .resolve(safePathSegment(projectId))
                .resolve(safePathSegment(subjectName));
        Files.createDirectories(baseDir);

        String storedName = safePathSegment(studentNo) + "_" + System.currentTimeMillis() + "_" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8) + extension;
        Path target = baseDir.resolve(storedName);
        Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/papers/exam-projects/" + safePathSegment(projectId) + "/" +
                safePathSegment(subjectName) + "/" + storedName;
    }

    private boolean isZipFile(String fileName) {
        return StringUtils.hasText(fileName) && fileName.toLowerCase().endsWith(".zip");
    }

    private boolean isAllowedPaperFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return ".jpg".equals(extension) || ".jpeg".equals(extension) || ".png".equals(extension) || ".pdf".equals(extension);
    }

    private String getFileExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) return "";
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index) : "";
    }

    private String safePathSegment(String value) {
        if (!StringUtils.hasText(value)) return "unknown";
        return value.trim().replaceAll("[\\\\/:*?\"<>|\\s]+", "_");
    }

    private boolean hasScore(ExamStudentScore score) {
        return score != null && Boolean.TRUE.equals(score.getScoreEntered());
    }

    private boolean hasAnswerSheet(ExamStudentScore score) {
        return score != null && StringUtils.hasText(score.getAnswerSheetUrl());
    }

    private int scoreRecordCount(List<ExamStudentScore> scores) {
        return (int) scores.stream().filter(this::hasScore).count();
    }

    private int paperRecordCount(List<ExamStudentScore> scores) {
        return (int) scores.stream().filter(this::hasAnswerSheet).count();
    }

    private Map<String, Integer> studentCountMap(List<String> classIds) {
        if (classIds == null || classIds.isEmpty()) return Collections.emptyMap();
        return sysStudentRepository.findByClassIdIn(classIds).stream().filter(item -> StringUtils.hasText(item.getClassId()))
                .collect(Collectors.toMap(SysStudent::getClassId, item -> 1, Integer::sum));
    }

    private List<String> normalize(Collection<String> values) {
        if (values == null) return Collections.emptyList();
        return values.stream().filter(StringUtils::hasText).map(String::trim).distinct().toList();
    }

    private List<String> list(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyList();
        try { return normalize(objectMapper.readValue(json, new TypeReference<List<String>>() {})); }
        catch (Exception ignored) { return Collections.emptyList(); }
    }

    @Override
    @Transactional
    public Result<Void> saveStudentScore(String projectId, String subjectName, String studentNo, List<Double> questionScores) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        UploadCtx uploadCtx = buildUploadCtx(projectId, subjectName);
        if (!uploadCtx.ok()) return Result.error(uploadCtx.msg());

        SysStudent student = uploadCtx.studentNoMap().get(normalizeStudentNo(studentNo));
        if (student == null) return Result.error("未找到学号为[" + studentNo + "]的学生");

        ExamClass examClass = uploadCtx.examClassMap().get(student.getClassId());
        if (examClass == null) return Result.error("学生所属班级未纳入本项目");

        ExamSubject subject = uploadCtx.classToSubjectMap().get(examClass.getId());
        if (subject == null) return Result.error("学生所属班级未开启[" + subjectName + "]科目");

        String scoreKey = subject.getId() + "_" + student.getStudentNo();
        ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), subject, student);
        
        double total = questionScores.stream().mapToDouble(v -> v == null ? 0D : v).sum();
        score.setTotalScore(total);
        score.setScoreEntered(Boolean.TRUE);
        try {
            score.setQuestionScores(objectMapper.writeValueAsString(questionScores));
        } catch (Exception ignored) {}

        examStudentScoreRepository.saveAndFlush(score);
        
        // 检查该科目是否已全量录入
        subject.setScoreUploaded(Boolean.TRUE);
        examSubjectRepository.saveAndFlush(subject);

        return Result.success("成绩保存成功", null);
    }

    @Override
    @Transactional
    public Result<String> uploadPublicPaper(String projectId, String subjectName, String type, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (!"template".equals(type) && !"original".equals(type)) {
            return Result.error("试卷类型错误，仅支持 template 或 original");
        }
        if (file == null || file.isEmpty()) return Result.error("请上传文件");

        String originalFilename = file.getOriginalFilename();
        if (!isAllowedPaperFile(originalFilename)) {
            return Result.error("仅支持 .pdf, .png, .jpg, .jpeg 格式");
        }

        try {
            // Store file
            String storedUrl = storePublicPaperFile(file.getInputStream(), projectId, subjectName, type, originalFilename);

            // Update all subjects in this project with this name
            List<ExamClass> examClasses = examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(projectId);
            if (examClasses.isEmpty()) return Result.error("项目中无班级数据");
            
            List<String> examClassIds = examClasses.stream().map(ExamClass::getId).toList();
            List<ExamSubject> subjects = examSubjectRepository.findByClassIdInOrderBySubjectNameAsc(examClassIds).stream()
                    .filter(s -> subjectName.equals(s.getSubjectName()))
                    .toList();

            if (subjects.isEmpty()) return Result.error("项目中无学科数据: " + subjectName);

            for (ExamSubject subject : subjects) {
                if ("template".equals(type)) {
                    subject.setAnswerUrl(storedUrl);
                } else if ("original".equals(type)) {
                    subject.setPaperUrl(storedUrl);
                }
            }
            examSubjectRepository.saveAllAndFlush(subjects);

            return Result.success("上传成功", storedUrl);
        } catch (Exception e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, String>> getPaperConfig(String projectId, String subjectName) {
        List<ExamClass> examClasses = examClassRepository.findByProjectIdOrderBySchoolAscGradeAscClassNameAsc(projectId);
        if (examClasses.isEmpty()) return Result.success(new HashMap<>());
        
        List<String> examClassIds = examClasses.stream().map(ExamClass::getId).toList();
        Optional<ExamSubject> subjectOpt = examSubjectRepository.findByClassIdInOrderBySubjectNameAsc(examClassIds).stream()
                .filter(s -> subjectName.equals(s.getSubjectName()))
                .findFirst();

        Map<String, String> config = new HashMap<>();
        if (subjectOpt.isPresent()) {
            config.put("templateUrl", subjectOpt.get().getAnswerUrl());
            config.put("originalUrl", subjectOpt.get().getPaperUrl());
        } else {
            config.put("templateUrl", null);
            config.put("originalUrl", null);
        }
        return Result.success(config);
    }

    private String storePublicPaperFile(InputStream inputStream, String projectId, String subjectName, String type, String originalFilename) throws Exception {
        String extension = getFileExtension(originalFilename);
        Path baseDir = Paths.get(globalConfigProperties.getPaperDir())
                .resolve("exam-projects")
                .resolve(safePathSegment(projectId))
                .resolve(safePathSegment(subjectName))
                .resolve("public");
        Files.createDirectories(baseDir);

        String storedName = type + "_" + System.currentTimeMillis() + extension;
        Path target = baseDir.resolve(storedName);
        Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/papers/exam-projects/" + safePathSegment(projectId) + "/" +
                safePathSegment(subjectName) + "/public/" + storedName;
    }

    private String json(List<String> values) {
        try { return objectMapper.writeValueAsString(normalize(values)); }
        catch (Exception ignored) { return "[]"; }
    }

    private String jsonMap(Map<String, Object> value) {
        if (value == null) return "{}";
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception ignored) { return "{}"; }
    }

    private Map<String, Object> map(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try { return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception ignored) { return Collections.emptyMap(); }
    }

    private <T> List<T> page(List<T> rows, int current, int size) {
        int from = Math.max((current - 1) * size, 0);
        if (from >= rows.size()) return Collections.emptyList();
        return rows.subList(from, Math.min(from + size, rows.size()));
    }

    private Map<String, Object> pageData(List<?> records, long total, int current, int size) {
        Map<String, Object> data = new HashMap<>();
        data.put("records", records);
        data.put("total", total);
        data.put("current", current);
        data.put("size", size);
        data.put("pages", size <= 0 ? 0 : (int) Math.ceil(total * 1.0 / size));
        return data;
    }

    private boolean contains(String source, String keyword) { return StringUtils.hasText(source) && source.contains(keyword); }
    private String id(String prefix) { return prefix + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 6); }
    private int num(Integer value) { return value == null ? 0 : value; }
    private double dbl(Double value) { return value == null ? 0D : value; }
    private double round(double value) { return Math.round(value * 100D) / 100D; }
    private String str(String value) { return value == null ? "" : value; }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) return cell.getDateCellValue().toString();
                double val = cell.getNumericCellValue();
                if (val == (long) val) return String.valueOf((long) val);
                return String.valueOf(val);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA: return cell.getCellFormula();
            default: return "";
        }
    }

    private StudentIdentifierType resolveIdentifierType(String header) {
        if (STUDENT_NO_HEADERS.contains(header)) return StudentIdentifierType.STUDENT_NO;
        if (STUDENT_NAME_HEADERS.contains(header)) return StudentIdentifierType.STUDENT_NAME;
        return null;
    }

    private StudentMatch matchStudent(
            StudentIdentifierType identifierType,
            String identifierRaw,
            Map<String, SysStudent> studentNoMap,
            Map<String, List<SysStudent>> studentNameMap) {
        if (identifierType == StudentIdentifierType.STUDENT_NO) {
            SysStudent student = studentNoMap.get(normalizeStudentNo(identifierRaw));
            if (student == null) return StudentMatch.skip("学号[" + identifierRaw + "]未在当前项目名单中");
            return StudentMatch.ok(student);
        }

        List<SysStudent> students = studentNameMap.getOrDefault(normalizeStudentName(identifierRaw), Collections.emptyList());
        if (students.isEmpty()) return StudentMatch.skip("姓名[" + identifierRaw + "]未在当前项目名单中");
        if (students.size() > 1) {
            return StudentMatch.error("姓名[" + identifierRaw + "]匹配到多名学生，请改用“学号”作为第一列重新导入");
        }
        return StudentMatch.ok(students.get(0));
    }

    private String normalizeHeader(String value) {
        if (!StringUtils.hasText(value)) return "";
        return value.trim().replace(" ", "").replace("-", "").replace("_", "").toLowerCase();
    }

    private String normalizeStudentName(String value) {
        if (!StringUtils.hasText(value)) return "";
        return value.trim().replaceAll("\\s+", "");
    }

    private String normalizeStudentNo(String value) {
        if (!StringUtils.hasText(value)) return "";
        return value.trim().replaceAll("\\s+", "");
    }

    private String readCellAsString(Cell cell, DataFormatter formatter, FormulaEvaluator evaluator) {
        if (cell == null) return "";
        return formatter.formatCellValue(cell, evaluator);
    }

    private int findLastNonEmptyCellIndex(Row row, DataFormatter formatter, FormulaEvaluator evaluator) {
        int lastCellNum = row.getLastCellNum();
        if (lastCellNum <= 0) return -1;
        for (int colIndex = lastCellNum - 1; colIndex >= 0; colIndex--) {
            if (StringUtils.hasText(readCellAsString(row.getCell(colIndex), formatter, evaluator))) {
                return colIndex;
            }
        }
        return -1;
    }

    private boolean isBlankRow(Row row, int lastColumnIndex, DataFormatter formatter, FormulaEvaluator evaluator) {
        for (int colIndex = 0; colIndex <= lastColumnIndex; colIndex++) {
            if (StringUtils.hasText(readCellAsString(row.getCell(colIndex), formatter, evaluator))) {
                return false;
            }
        }
        return true;
    }

    private record Prepared(
            boolean ok,
            String msg,
            String name,
            List<String> selectedSchoolIds,
            List<String> selectedClassIds,
            List<String> coveredSchoolIds,
            List<SysClass> classes,
            List<String> subjects,
            Map<String, Integer> studentCountMap,
            Map<String, Object> benchmarks) {
        private static Prepared fail(String msg) {
            return new Prepared(
                    false,
                    msg,
                    "",
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyMap(),
                    Collections.emptyMap()
            );
        }
    }

    private record Ctx(
            List<ExamClass> examClasses,
            List<ExamSubject> subjects,
            List<SysStudent> students,
            List<ExamStudentScore> scores,
            Map<String, ExamClass> classMap,
            Map<String, ExamSubject> subjectMap,
            Map<String, Integer> doneMap) {}

    private record UploadCtx(
            boolean ok,
            String msg,
            Map<String, ExamSubject> classToSubjectMap,
            Map<String, ExamClass> examClassMap,
            Map<String, SysStudent> studentNoMap,
            Map<String, List<SysStudent>> studentNameMap,
            Map<String, ExamStudentScore> existingScoreMap) {
        private static UploadCtx ok(
                Map<String, ExamSubject> classToSubjectMap,
                Map<String, ExamClass> examClassMap,
                Map<String, SysStudent> studentNoMap,
                Map<String, List<SysStudent>> studentNameMap,
                Map<String, ExamStudentScore> existingScoreMap) {
            return new UploadCtx(true, "", classToSubjectMap, examClassMap, studentNoMap, studentNameMap, existingScoreMap);
        }

        private static UploadCtx fail(String msg) {
            return new UploadCtx(false, msg, Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), new HashMap<>());
        }
    }

    private enum StudentIdentifierType {
        STUDENT_NO,
        STUDENT_NAME
    }

    private record StudentMatch(
            boolean ok,
            boolean skipped,
            SysStudent student,
            String msg) {
        private static StudentMatch ok(SysStudent student) {
            return new StudentMatch(true, false, student, "");
        }

        private static StudentMatch skip(String msg) {
            return new StudentMatch(false, true, null, msg);
        }

        private static StudentMatch error(String msg) {
            return new StudentMatch(false, false, null, msg);
        }
    }

    private record FileMatch(
            boolean ok,
            boolean skipped,
            SysStudent student,
            String msg) {
        private static FileMatch ok(SysStudent student) {
            return new FileMatch(true, false, student, "");
        }

        private static FileMatch skip(String msg) {
            return new FileMatch(false, true, null, msg);
        }

        private static FileMatch error(String msg) {
            return new FileMatch(false, false, null, msg);
        }
    }
}
