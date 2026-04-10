package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
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
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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

@Service
public class ExamProjectServiceImpl implements ExamProjectService {

    private static final String NORMAL = "NORMAL";
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
        data.put("stats", Map.of(
                "schoolCount", num(project.getSchoolCount()),
                "classCount", num(project.getClassCount()),
                "studentCount", num(project.getStudentCount()),
                "subjectCount", num(project.getSubjectCount()),
                "scoreRecordCount", ctx.scores().size()
        ));
        data.put("classes", ctx.examClasses().stream().map(this::classItem).toList());
        data.put("subjects", scoreSummaryRows(ctx));
        data.put("schools", ctx.examClasses().stream().collect(Collectors.groupingBy(ExamClass::getSchoolId, LinkedHashMap::new, Collectors.toList()))
                .values().stream().map(items -> Map.of(
                        "schoolId", items.get(0).getSchoolId(),
                        "schoolName", items.get(0).getSchool(),
                        "classCount", items.size(),
                        "studentCount", items.stream().mapToInt(it -> num(it.getStudentCount())).sum()
                )).toList());
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
                "scoreRecordCount", ctx.scores().size(),
                "studentCount", num(project.getStudentCount())
        ));
        return Result.success("获取成功", data);
    }

    @Override
    public Result<Map<String, Object>> getProjectScorePage(String projectId, String subjectName, int current, int size, String keyword, String schoolId, String classId) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        Ctx ctx = ctx(projectId);
        Set<String> subjectIds = ctx.subjects().stream()
                .filter(subject -> !StringUtils.hasText(subjectName) || subjectName.equals(subject.getSubjectName()))
                .map(ExamSubject::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        List<Map<String, Object>> rows = ctx.scores().stream()
                .filter(score -> subjectIds.contains(score.getSubjectId()))
                .map(score -> scoreItem(score, ctx))
                .filter(item -> scoreMatch(item, keyword, schoolId, classId))
                .sorted(Comparator.comparing((Map<String, Object> item) -> ((Number) item.get("totalScore")).doubleValue()).reversed())
                .toList();
        return Result.success("获取成功", pageData(page(rows, current, size), rows.size(), current, size));
    }

    private void saveProject(ExamProject project, Prepared prepared) {
        project.setName(prepared.name());
        project.setExamType(NORMAL);
        project.setSelectedSchoolIds(json(prepared.selectedSchoolIds()));
        project.setSelectedClassIds(json(prepared.selectedClassIds()));
        project.setSubjectNames(json(prepared.subjects()));
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
                studentCountMap(resolvedClassIds)
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
        for (ExamStudentScore score : scores) studentSubjectSet.computeIfAbsent(score.getStudentNo(), key -> new LinkedHashSet<>()).add(score.getSubjectId());
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
                    List<ExamStudentScore> scores = ctx.scores().stream().filter(score -> subjectIds.contains(score.getSubjectId())).toList();
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("subjectName", entry.getKey());
                    item.put("classCount", classIds.size());
                    item.put("studentCount", classIds.stream().map(ctx.classMap()::get).filter(v -> v != null).mapToInt(v -> num(v.getStudentCount())).sum());
                    item.put("scoreCount", scores.size());
                    item.put("avgScore", scores.isEmpty() ? null : round(scores.stream().mapToDouble(score -> dbl(score.getTotalScore())).average().orElse(0)));
                    item.put("maxScore", scores.isEmpty() ? null : round(scores.stream().mapToDouble(score -> dbl(score.getTotalScore())).max().orElse(0)));
                    item.put("minScore", scores.isEmpty() ? null : round(scores.stream().mapToDouble(score -> dbl(score.getTotalScore())).min().orElse(0)));
                    item.put("scoreUploaded", entry.getValue().stream().anyMatch(subject -> Boolean.TRUE.equals(subject.getScoreUploaded())));
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
        item.put("totalScore", dbl(score.getTotalScore()));
        item.put("updateTime", score.getUpdateTime());
        return item;
    }

    private Map<String, Object> projectBase(ExamProject project) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", project.getId());
        item.put("name", project.getName());
        item.put("examType", project.getExamType());
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

    private String json(List<String> values) {
        try { return objectMapper.writeValueAsString(normalize(values)); }
        catch (Exception ignored) { return "[]"; }
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

    private record Prepared(
            boolean ok,
            String msg,
            String name,
            List<String> selectedSchoolIds,
            List<String> selectedClassIds,
            List<String> coveredSchoolIds,
            List<SysClass> classes,
            List<String> subjects,
            Map<String, Integer> studentCountMap) {
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
}
