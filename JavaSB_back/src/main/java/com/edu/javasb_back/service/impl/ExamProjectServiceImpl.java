package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import com.edu.javasb_back.model.dto.PaperLayoutSaveDTO;
import com.edu.javasb_back.model.dto.PaperOcrAutoCutDTO;
import com.edu.javasb_back.model.dto.PaperRegionOcrDTO;
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
import com.edu.javasb_back.service.OssStorageService;
import com.edu.javasb_back.service.support.AliyunPaperOcrService;
import com.edu.javasb_back.service.support.TaskProgressManager;
import com.github.junrar.Archive;
import com.edu.javasb_back.utils.ExcelExportUtils;
import com.edu.javasb_back.utils.TemplateDownloadUtils;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import java.util.Arrays;
import com.github.junrar.exception.UnsupportedRarEncryptedException;
import com.github.junrar.exception.UnsupportedRarV5Exception;
import com.github.junrar.rarfile.FileHeader;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
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

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.ConcurrentHashMap;

record ArchivePaperEntry(String entryPath, String fileName, byte[] content) {}
record PaperAssetContext(String previewUrl, Path paperPath, Map<String, Object> mergeInfo, boolean mergeInfoChanged) {}
record OcrExecutionResult(String requestId, String ocrSubject, String imageType, String cutType, int pageCount, List<Map<String, Object>> regions, List<Map<String, Object>> pageResults) {}
record StoredPaperAsset(String url, Map<String, Object> mergeInfo) {}
record RenderResult(byte[] bytes, Map<String, Object> mergeInfo) {}

record OcrTaskStatus(String taskId, String status, int progress, String message, Object result, long startTime) {}

record Prepared(
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
    public static Prepared fail(String msg) {
        return new Prepared(false, msg, "", Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap());
    }
}

record Ctx(
        List<ExamClass> examClasses,
        List<ExamSubject> subjects,
        List<SysStudent> students,
        List<ExamStudentScore> scores,
        Map<String, ExamClass> classMap,
        Map<String, ExamSubject> subjectMap,
        Map<String, Integer> doneMap) {}

record UploadCtx(
        boolean ok,
        String msg,
        ExamSubject subject,
        Map<String, ExamClass> examClassMap,
        Map<String, SysStudent> studentNoMap,
        Map<String, List<SysStudent>> studentNameMap,
        Map<String, ExamStudentScore> existingScoreMap) {
    public static UploadCtx ok(ExamSubject subject, Map<String, ExamClass> examClassMap, Map<String, SysStudent> studentNoMap, Map<String, List<SysStudent>> studentNameMap, Map<String, ExamStudentScore> existingScoreMap) {
        return new UploadCtx(true, "", subject, examClassMap, studentNoMap, studentNameMap, existingScoreMap);
    }
    public static UploadCtx fail(String msg) {
        return new UploadCtx(false, msg, null, Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap(), new HashMap<>());
    }
}

enum StudentIdentifierType { STUDENT_NO, STUDENT_NAME }

record StudentMatch(boolean ok, boolean skipped, SysStudent student, String msg, List<SysStudent> candidates) {
    public static StudentMatch ok(SysStudent student) { return new StudentMatch(true, false, student, "", Collections.emptyList()); }
    public static StudentMatch skip(String msg) { return new StudentMatch(false, true, null, msg, Collections.emptyList()); }
    public static StudentMatch error(String msg) { return new StudentMatch(false, false, null, msg, Collections.emptyList()); }
    public static StudentMatch conflict(List<SysStudent> candidates, String msg) { return new StudentMatch(false, false, null, msg, candidates); }
    public boolean hasConflict() { return !candidates.isEmpty(); }
}

record FileMatch(boolean ok, boolean skipped, SysStudent student, String msg) {
    public static FileMatch ok(SysStudent student) { return new FileMatch(true, false, student, ""); }
    public static FileMatch skip(String msg) { return new FileMatch(false, true, null, msg); }
    public static FileMatch error(String msg) { return new FileMatch(false, false, null, msg); }
}

@Service
public class ExamProjectServiceImpl implements ExamProjectService {

    private final Map<String, OcrTaskStatus> ocrTasks = new ConcurrentHashMap<>();

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    private static final Logger log = LoggerFactory.getLogger(ExamProjectServiceImpl.class);

    private static final String NORMAL = "NORMAL";
    private static final int PDF_RENDER_DPI = 144;
    private static final Set<String> STUDENT_NO_HEADERS = Set.of("学号", "考号", "准考证号", "学生学号", "studentno", "student_no", "studentid", "student_id");
    private static final Set<String> STUDENT_NAME_HEADERS = Set.of("姓名", "学生姓名", "name", "studentname", "student_name");
    private static final List<String> SUBJECT_OPTIONS = Arrays.asList(
            "语文", "小学语文", "初中语文",
            "数学", "小学数学", "初中数学",
            "英语", "小学英语", "初中英语",
            "物理", "初中物理",
            "化学", "初中化学",
            "生物", "初中生物",
            "历史", "初中历史",
            "地理", "初中地理",
            "政治", "初中政治"
    );
    private static final Pattern QUESTION_NUMBER_PATTERN = Pattern.compile("(\\d+)");

    @Autowired private ExamProjectRepository examProjectRepository;
    @Autowired private ExamClassRepository examClassRepository;
    @Autowired private ExamSubjectRepository examSubjectRepository;
    @Autowired private ExamStudentScoreRepository examStudentScoreRepository;
    @Autowired private SysSchoolRepository sysSchoolRepository;
    @Autowired private SysClassRepository sysClassRepository;
    @Autowired private SysStudentRepository sysStudentRepository;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AliyunPaperOcrService aliyunPaperOcrService;
    @Autowired private OssStorageService ossStorageService;
    @Autowired private GlobalConfigProperties globalConfigProperties;
    @PersistenceContext private EntityManager entityManager;

    @Autowired private TaskProgressManager taskProgressManager;
    @Autowired @org.springframework.context.annotation.Lazy private ExamProjectService self;

    private void forceFreshRead() {
        if (entityManager != null) {
            entityManager.clear();
        }
    }

    @Override
    public Result<Map<String, Object>> getProjectList(int current, int size, String name) {
        forceFreshRead();
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
        forceFreshRead();
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
        forceFreshRead();
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
        forceFreshRead();
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
        forceFreshRead();
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
        forceFreshRead();
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        Ctx ctx = ctx(projectId);
        ExamSubject targetSubject = ctx.subjects().stream()
                .filter(s -> !StringUtils.hasText(subjectName) || subjectName.equals(s.getSubjectName()))
                .findFirst()
                .orElse(null);
        if (targetSubject == null) {
            return Result.error("项目中不存在学科: " + subjectName);
        }

        Map<String, ExamStudentScore> scoreMap = ctx.scores().stream()
                .filter(s -> targetSubject.getId().equals(s.getSubjectId()))
                .collect(Collectors.toMap(ExamStudentScore::getStudentNo, s -> s, (a, b) -> a));

        List<Map<String, Object>> rows = ctx.students().stream()
                .map(student -> {
                    ExamStudentScore score = scoreMap.get(student.getStudentNo());
                    String answerSheetUrl = score == null ? null : ossStorageService.toCdnUrl(score.getAnswerSheetUrl());
                    
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", score != null ? score.getId() : null);
                    item.put("subjectName", targetSubject.getSubjectName());
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
                    item.put("answerSheetUrl", answerSheetUrl);
                    item.put("answerSheetLayouts", score == null ? "[]" : score.getAnswerSheetLayouts());
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
    public ResponseEntity<Resource> downloadScoreTemplate() {
        return TemplateDownloadUtils.buildDownloadResponse(
                Arrays.asList(
                        "templates/成绩导入模板.xlsx",
                        "static/resource/成绩导入模板.xlsx",
                        "assets/成绩导入模板.xlsx",
                        "assests/成绩导入模板.xlsx"
                ),
                "成绩导入模板.xlsx"
        );
    }

    @Override
    public Result<Map<String, Object>> importScores(String projectId, String subjectName, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (file == null || file.isEmpty()) return Result.error("请上传成绩文件");

        String taskId = UUID.randomUUID().toString();
        try {
            byte[] excelBytes = file.getBytes();
            taskProgressManager.initTask(taskId, "成绩导入: " + subjectName, 0);
            self.importScoresAsync(taskId, projectId, subjectName, excelBytes);
            return Result.success("导入任务已启动", Map.of("taskId", taskId));
        } catch (Exception e) {
            return Result.error("启动导入任务失败: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async("taskExecutor")
    public void importScoresAsync(String taskId, String projectId, String subjectName, byte[] excelBytes) {
        try {
            Ctx ctx = ctx(projectId);
            ExamSubject subject = ctx.subjects().stream()
                    .filter(s -> subjectName.equals(s.getSubjectName()))
                    .findFirst()
                    .orElse(null);
            if (subject == null) {
                taskProgressManager.finishTask(taskId, "failed");
                taskProgressManager.addLog(taskId, "项目中不存在学科: " + subjectName);
                return;
            }

            Map<String, ExamClass> examClassMap = ctx.examClasses().stream()
                    .filter(item -> StringUtils.hasText(item.getSourceClassId()))
                    .collect(Collectors.toMap(ExamClass::getSourceClassId, Function.identity(), (a, b) -> a));

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

            ExamProject project = examProjectRepository.findById(projectId).orElse(null);
            Double fullScore = null;
            if (project != null) {
                Map<String, Object> benchmarks = map(project.getSubjectBenchmarks());
                Map<String, Object> benchmark = nestedMap(benchmarks.get(subjectName));
                Object totalScoreObj = benchmark.get("totalScore");
                if (totalScoreObj instanceof Number num) {
                    fullScore = num.doubleValue();
                }
            }

            List<String> logs = new ArrayList<>();
            List<Map<String, Object>> nameConflicts = new ArrayList<>();
            List<ExamStudentScore> scoresToSave = new ArrayList<>();
            Set<String> importedScoreKeys = new LinkedHashSet<>();
            Map<String, ExamStudentScore> existingScoreMap = ctx.scores().stream()
                    .filter(score -> subject.getId().equals(score.getSubjectId()))
                    .collect(Collectors.toMap(
                            score -> score.getSubjectId() + "_" + score.getStudentNo(),
                            Function.identity(),
                            (a, b) -> b
                    ));

            int rowCount = 0;
            int skipCount = 0;
            int errorCount = 0;
            int conflictCount = 0;

            try (InputStream is = new ByteArrayInputStream(excelBytes);
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                if (sheet == null) {
                    taskProgressManager.finishTask(taskId, "failed");
                    taskProgressManager.addLog(taskId, "Excel中没有可读取的工作表");
                    return;
                }

                DataFormatter formatter = new DataFormatter();
                FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
                int headerRowIndex = sheet.getFirstRowNum();
                Row headerRow = sheet.getRow(headerRowIndex);
                if (headerRow == null) {
                    taskProgressManager.finishTask(taskId, "failed");
                    taskProgressManager.addLog(taskId, "Excel第一行不能为空");
                    return;
                }

                String identifierHeader = normalizeHeader(readCellAsString(headerRow.getCell(0), formatter, evaluator));
                StudentIdentifierType identifierType = resolveIdentifierType(identifierHeader);
                if (identifierType == null) {
                    taskProgressManager.finishTask(taskId, "failed");
                    taskProgressManager.addLog(taskId, "Excel第一列标题仅支持“学号”或“姓名”");
                    return;
                }

                int lastScoreColumnIndex = findLastNonEmptyCellIndex(headerRow, formatter, evaluator);
                List<Integer> scoreColumnIndexes = new ArrayList<>();
                for (int colIndex = 1; colIndex <= lastScoreColumnIndex; colIndex++) {
                    scoreColumnIndexes.add(colIndex);
                }

                int lastRowNum = sheet.getLastRowNum();
                int totalRows = lastRowNum - headerRowIndex;
                taskProgressManager.updateProgress(taskId, 0, "开始处理 " + totalRows + " 条成绩数据...");
                TaskProgressManager.TaskStatus status = taskProgressManager.getTaskStatus(taskId);
                if (status != null) status.setTotal(totalRows);

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

                    if (fullScore != null && total > fullScore + 0.01) {
                        logs.add("第" + (rowIndex + 1) + "行: 总分 (" + total + ") 超过学科满分 (" + fullScore + ")");
                        errorCount++;
                        continue;
                    }

                    StudentMatch studentMatch = matchStudent(identifierType, identifierRaw, studentNoMap, studentNameMap);
                    if (!studentMatch.ok()) {
                        if (studentMatch.hasConflict()) {
                            logs.add("第" + (rowIndex + 1) + "行: " + studentMatch.msg());
                            nameConflicts.add(buildScoreImportConflict(
                                    rowIndex + 1,
                                    identifierRaw,
                                    questionScores,
                                    total,
                                    studentMatch.candidates()
                            ));
                            conflictCount++;
                        } else {
                            logs.add("第" + (rowIndex + 1) + "行: " + studentMatch.msg());
                            if (studentMatch.skipped()) skipCount++;
                            else errorCount++;
                        }
                        continue;
                    }
                    SysStudent student = studentMatch.student();

                    if (!examClassMap.containsKey(student.getClassId())) {
                        logs.add("第" + (rowIndex + 1) + "行: 学生[" + identifierRaw + "]未在当前考试项目的班级名单中");
                        skipCount++;
                        continue;
                    }

                    String scoreKey = subject.getId() + "_" + student.getStudentNo();
                    if (!importedScoreKeys.add(scoreKey)) {
                        logs.add("第" + (rowIndex + 1) + "行: 学生[" + identifierRaw + "]在当前文件中重复出现");
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
                    existingScoreMap.put(student.getStudentNo(), score);
                    rowCount++;

                    if (rowIndex % 50 == 0) {
                        taskProgressManager.updateProgress(taskId, rowIndex - headerRowIndex, "已处理 " + (rowIndex - headerRowIndex) + " 条数据...");
                    }
                }
            }

            if (!scoresToSave.isEmpty()) {
                examStudentScoreRepository.saveAllAndFlush(scoresToSave);
            }
            subject.setScoreUploaded(Boolean.TRUE);
            examSubjectRepository.saveAndFlush(subject);

            Map<String, Object> resultData = buildScoreImportResultData(rowCount, skipCount, errorCount, conflictCount, logs, nameConflicts);
            taskProgressManager.finishTask(taskId, "completed", resultData);
            taskProgressManager.addLog(taskId, "成绩导入完成: " + resultData.get("summary"));

        } catch (Exception e) {
            taskProgressManager.finishTask(taskId, "failed");
            taskProgressManager.addLog(taskId, "处理失败: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Resource> exportScores(String projectId, String subjectName) {
        Ctx ctx = ctx(projectId);
        List<ExamSubject> targetSubjects = ctx.subjects().stream()
                .filter(s -> !StringUtils.hasText(subjectName) || subjectName.equals(s.getSubjectName()))
                .toList();

        if (targetSubjects.isEmpty()) return ResponseEntity.notFound().build();

        List<String> headers = new ArrayList<>(Arrays.asList("学号", "姓名", "学校", "年级", "班级"));
        for (ExamSubject s : targetSubjects) {
            headers.add(s.getSubjectName());
        }

        List<List<String>> rows = new ArrayList<>();
        for (SysStudent student : ctx.students()) {
            List<String> row = new ArrayList<>();
            row.add(student.getStudentNo());
            row.add(student.getName());
            
            ExamClass ec = ctx.classMap().get(student.getClassId());
            row.add(ec != null ? ec.getSchool() : "");
            row.add(ec != null ? ec.getGrade() : "");
            row.add(ec != null ? ec.getClassName() : "");

            for (ExamSubject s : targetSubjects) {
                ExamStudentScore score = ctx.scores().stream()
                        .filter(sc -> sc.getSubjectId().equals(s.getId()) && sc.getStudentNo().equals(student.getStudentNo()))
                        .findFirst()
                        .orElse(null);
                row.add(score != null && score.getTotalScore() != null ? String.valueOf(score.getTotalScore()) : "");
            }
            rows.add(row);
        }

        String downloadName = "成绩导出-" + (StringUtils.hasText(subjectName) ? subjectName : "全部") + ".xlsx";
        return ExcelExportUtils.buildExcelResponse("成绩列表", downloadName, headers, rows);
    }

    @Override
    public Result<Map<String, Object>> importAnswerSheets(String projectId, String subjectName, MultipartFile file) {
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        if (!StringUtils.hasText(subjectName)) return Result.error("学科名称不能为空");
        if (file == null || file.isEmpty()) return Result.error("请上传试卷压缩包");

        String originalFilename = file.getOriginalFilename();
        if (!isSupportedArchiveFile(originalFilename)) {
            return Result.error("试卷批量导入仅支持 .zip / .rar 压缩包");
        }

        String taskId = UUID.randomUUID().toString();
        try {
            byte[] archiveBytes = file.getBytes();
            taskProgressManager.initTask(taskId, "批量导入试卷: " + originalFilename, 0); // 初始 total 为 0，解析后再更新
            self.importAnswerSheetsAsync(taskId, projectId, subjectName, archiveBytes, originalFilename);
            return Result.success("导入任务已启动", Map.of("taskId", taskId));
        } catch (Exception e) {
            return Result.error("启动导入任务失败: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async("taskExecutor")
    public void importAnswerSheetsAsync(String taskId, String projectId, String subjectName, byte[] archiveBytes, String originalFilename) {
        UploadCtx uploadCtx = buildUploadCtx(projectId, subjectName);
        if (!uploadCtx.ok()) {
            taskProgressManager.finishTask(taskId, "failed");
            taskProgressManager.addLog(taskId, "初始化失败: " + uploadCtx.msg());
            return;
        }

        List<String> logs = new ArrayList<>();
        List<ExamStudentScore> scoresToSave = new ArrayList<>();
        Set<String> importedKeys = new LinkedHashSet<>();
        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;

        try {
            List<ArchivePaperEntry> paperEntries = findPaperEntries(new ByteArrayInputStream(archiveBytes), originalFilename);
            if (paperEntries.isEmpty()) {
                taskProgressManager.finishTask(taskId, "failed");
                taskProgressManager.addLog(taskId, "压缩包内未找到可导入的试卷文件");
                return;
            }

            taskProgressManager.updateProgress(taskId, 0, "开始处理 " + paperEntries.size() + " 个文件...");
            // 更新总数
            TaskProgressManager.TaskStatus status = taskProgressManager.getTaskStatus(taskId);
            if (status != null) status.setTotal(paperEntries.size());

            for (int i = 0; i < paperEntries.size(); i++) {
                ArchivePaperEntry paperEntry = paperEntries.get(i);
                String entryName = paperEntry.fileName();
                String entryPath = paperEntry.entryPath();

                try {
                    FileMatch fileMatch = matchStudentByPaperFileName(entryName, uploadCtx.studentNoMap(), uploadCtx.studentNameMap());
                    if (!fileMatch.ok()) {
                        String msg = "文件[" + entryPath + "]: " + fileMatch.msg();
                        taskProgressManager.addLog(taskId, msg);
                        if (fileMatch.skipped()) skipCount++;
                        else errorCount++;
                        continue;
                    }

                    SysStudent student = fileMatch.student();
                    if (!uploadCtx.examClassMap().containsKey(student.getClassId())) {
                        String msg = "文件[" + entryPath + "]: 学生[" + student.getName() + "]未在当前考试项目班级中";
                        taskProgressManager.addLog(taskId, msg);
                        skipCount++;
                        continue;
                    }

                    String scoreKey = uploadCtx.subject().getId() + "_" + student.getStudentNo();
                    if (!importedKeys.add(scoreKey)) {
                        String msg = "文件[" + entryPath + "]: 当前压缩包内重复上传了同一学生试卷";
                        taskProgressManager.addLog(taskId, msg);
                        errorCount++;
                        continue;
                    }

                    StoredPaperAsset asset = storePaperFile(
                            new ByteArrayInputStream(paperEntry.content()),
                            projectId,
                            subjectName,
                            student.getStudentNo(),
                            entryName
                    );
                    ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), uploadCtx.subject(), student);
                    score.setAnswerSheetUrl(asset.url());

                    if (hasValidPaperMergeInfo(asset.mergeInfo())) {
                        score.setAnswerMergeInfo(jsonMap(asset.mergeInfo()));
                    }

                    scoresToSave.add(score);
                    uploadCtx.existingScoreMap().put(scoreKey, score);
                    successCount++;
                    taskProgressManager.updateProgress(taskId, i + 1, "已处理: " + entryName);
                } catch (Exception e) {
                    taskProgressManager.addLog(taskId, "处理文件[" + entryPath + "]异常: " + e.getMessage());
                    errorCount++;
                }
            }

            if (!scoresToSave.isEmpty()) {
                examStudentScoreRepository.saveAllAndFlush(scoresToSave);
            }
            
            Map<String, Object> resultData = buildBatchImportResultData("试卷导入完成", successCount, skipCount, errorCount, logs);
            taskProgressManager.finishTask(taskId, "completed", resultData);

        } catch (Exception e) {
            taskProgressManager.finishTask(taskId, "failed");
            taskProgressManager.addLog(taskId, "处理异常: " + e.getMessage());
        }
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

        if (!uploadCtx.examClassMap().containsKey(student.getClassId())) return Result.error("该学生所在班级未纳入当前考试项目");

        String scoreKey = uploadCtx.subject().getId() + "_" + student.getStudentNo();
        try {
            StoredPaperAsset asset = storePaperFile(file.getInputStream(), projectId, subjectName, student.getStudentNo(), originalFilename);
            ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), uploadCtx.subject(), student);
            score.setAnswerSheetUrl(asset.url());

            // 如果上传的是 PDF 或有分页信息，保存分页信息
            if (hasValidPaperMergeInfo(asset.mergeInfo())) {
                score.setAnswerMergeInfo(jsonMap(asset.mergeInfo()));
            }

            examStudentScoreRepository.saveAndFlush(score);
            return Result.success("试卷上传成功", asset.url());
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

        syncProjectClassesAndSubjects(project.getId(), prepared);
    }

    private void syncProjectClassesAndSubjects(String projectId, Prepared prepared) {
        List<ExamClass> existingClasses = examClassRepository.findByProjectId(projectId);
        Map<String, ExamClass> existingClassMap = existingClasses.stream()
                .filter(item -> StringUtils.hasText(item.getSourceClassId()))
                .collect(Collectors.toMap(ExamClass::getSourceClassId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
        Set<String> targetClassIds = prepared.classes().stream().map(SysClass::getClassid).collect(Collectors.toCollection(LinkedHashSet::new));

        Map<String, String> schoolNameMap = sysSchoolRepository.findBySchoolIdIn(prepared.coveredSchoolIds()).stream()
                .collect(Collectors.toMap(SysSchool::getSchoolId, SysSchool::getName, (a, b) -> a));

        List<ExamClass> classesToSave = prepared.classes().stream().map(sysClass -> {
            ExamClass item = existingClassMap.get(sysClass.getClassid());
            if (item == null) {
                item = new ExamClass();
                item.setId(id("EC"));
                item.setProjectId(projectId);
                item.setSourceClassId(sysClass.getClassid());
            }
            item.setSchoolId(sysClass.getSchoolId());
            item.setSchool(schoolNameMap.getOrDefault(sysClass.getSchoolId(), ""));
            item.setGrade(sysClass.getGrade());
            item.setClassName(sysClass.getAlias());
            item.setStudentCount(prepared.studentCountMap().getOrDefault(sysClass.getClassid(), 0));
            return item;
        }).toList();
        List<ExamClass> savedClasses = examClassRepository.saveAll(classesToSave);

        List<ExamClass> classesToDelete = existingClasses.stream()
                .filter(item -> !targetClassIds.contains(item.getSourceClassId()))
                .toList();
        if (!classesToDelete.isEmpty()) {
            examClassRepository.deleteAll(classesToDelete);
        }

        syncProjectSubjects(projectId, prepared.subjects());
    }

    private void syncProjectSubjects(String projectId, List<String> subjects) {
        List<ExamSubject> existingSubjects = examSubjectRepository.findByProjectIdOrderBySubjectNameAsc(projectId);
        Map<String, ExamSubject> existingSubjectMap = existingSubjects.stream()
                .collect(Collectors.toMap(ExamSubject::getSubjectName, Function.identity(), (a, b) -> a, LinkedHashMap::new));

        List<ExamSubject> subjectsToSave = new ArrayList<>();
        Set<String> targetSubjectNames = new LinkedHashSet<>(subjects);
        for (String subjectName : subjects) {
            ExamSubject subject = existingSubjectMap.get(subjectName);
            if (subject == null) {
                subject = new ExamSubject();
                subject.setId(id("ES"));
                subject.setProjectId(projectId);
                subject.setSubjectName(subjectName);
                subject.setScoreUploaded(Boolean.FALSE);
                subject.setPaperLayouts("[]");
                subject.setAnswersLayouts("[]");
            } else {
                subject.setProjectId(projectId);
                subject.setSubjectName(subjectName);
                if (!StringUtils.hasText(subject.getPaperLayouts())) {
                    subject.setPaperLayouts("[]");
                }
                if (!StringUtils.hasText(subject.getAnswersLayouts())) {
                    subject.setAnswersLayouts("[]");
                }
            }
            subjectsToSave.add(subject);
        }

        List<ExamSubject> subjectsToDelete = existingSubjects.stream()
                .filter(item -> !targetSubjectNames.contains(item.getSubjectName()))
                .toList();
        if (!subjectsToDelete.isEmpty()) {
            examSubjectRepository.deleteAll(subjectsToDelete);
        }
        if (!subjectsToSave.isEmpty()) {
            examSubjectRepository.saveAll(subjectsToSave);
        }
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
        List<ExamSubject> subjects = examSubjectRepository.findByProjectIdOrderBySubjectNameAsc(projectId);
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
        return ctx.subjects().stream().map(subject -> {
            List<ExamStudentScore> scoreRecords = ctx.scores().stream()
                    .filter(score -> subject.getId().equals(score.getSubjectId()) && hasScore(score))
                    .toList();
            long paperCount = ctx.scores().stream()
                    .filter(score -> subject.getId().equals(score.getSubjectId()) && hasAnswerSheet(score))
                    .count();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("subjectName", subject.getSubjectName());
            item.put("classCount", ctx.examClasses().size());
            item.put("studentCount", ctx.students().size());
            item.put("paperCount", paperCount);
            item.put("scoreCount", scoreRecords.size());
            item.put("avgScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).average().orElse(0)));
            item.put("maxScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).max().orElse(0)));
            item.put("minScore", scoreRecords.isEmpty() ? null : round(scoreRecords.stream().mapToDouble(score -> dbl(score.getTotalScore())).min().orElse(0)));
            item.put("paperUploaded", StringUtils.hasText(subject.getPaperUrl()) || StringUtils.hasText(subject.getAnswerUrl()));
            item.put("scoreUploaded", Boolean.TRUE.equals(subject.getScoreUploaded()));
            return item;
        }).toList();
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
        ExamSubject subject = ctx.subjects().stream()
                .filter(item -> subjectName.equals(item.getSubjectName()))
                .findFirst()
                .orElse(null);
        if (subject == null) {
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

        Map<String, ExamStudentScore> existingScoreMap = ctx.scores().stream()
                .filter(score -> subject.getId().equals(score.getSubjectId()))
                .collect(Collectors.toMap(
                        score -> score.getSubjectId() + "_" + score.getStudentNo(),
                        Function.identity(),
                        (a, b) -> b
                ));
        return UploadCtx.ok(subject, examClassMap, studentNoMap, studentNameMap, existingScoreMap);
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

    private StoredPaperAsset storePaperFile(InputStream inputStream, String projectId, String subjectName, String studentNo, String originalFilename) throws Exception {
        String storedNamePrefix = safePathSegment(studentNo) + "_" + System.currentTimeMillis() + "_" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return storePaperAsset(
                inputStream,
                "papers/exam-projects/" + safePathSegment(projectId) + "/" + safePathSegment(subjectName) + "/",
                storedNamePrefix,
                originalFilename
        );
    }

    private boolean isZipFile(String fileName) {
        return StringUtils.hasText(fileName) && fileName.toLowerCase().endsWith(".zip");
    }

    private boolean isRarFile(String fileName) {
        return StringUtils.hasText(fileName) && fileName.toLowerCase().endsWith(".rar");
    }

    private boolean isSupportedArchiveFile(String fileName) {
        return isZipFile(fileName) || isRarFile(fileName);
    }

    private boolean isAllowedPaperFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return ".jpg".equals(extension) || ".jpeg".equals(extension) || ".png".equals(extension) || ".pdf".equals(extension);
    }

    private List<ArchivePaperEntry> findPaperEntries(InputStream inputStream, String originalFilename) throws Exception {
        byte[] archiveBytes = inputStream.readAllBytes();
        if (isRarFile(originalFilename)) {
            return findPaperEntriesFromRar(new ByteArrayInputStream(archiveBytes));
        }
        return findPaperEntriesFromZip(archiveBytes);
    }

    private List<ArchivePaperEntry> findPaperEntriesFromZip(byte[] archiveBytes) throws Exception {
        try {
            // 首先尝试使用 UTF-8 编码解析（现代标准）
            return doParseZip(archiveBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // 如果解析失败（通常是文件名编码不匹配导致 IllegalArgumentException 或 MalformedInputException）
            // 尝试使用 GBK 编码解析（Windows 默认编码）
            try {
                return doParseZip(archiveBytes, Charset.forName("GBK"));
            } catch (Exception e2) {
                // 如果 GBK 也失败，抛出最初的异常
                throw e;
            }
        }
    }

    private List<ArchivePaperEntry> doParseZip(byte[] archiveBytes, Charset charset) throws Exception {
        List<ArchivePaperEntry> paperEntries = new ArrayList<>();
        try (ZipInputStream zipInputStream = new ZipInputStream(new ByteArrayInputStream(archiveBytes), charset)) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                String entryPath = normalizeArchiveEntryPath(entry.getName());
                if (shouldSkipArchiveEntry(entry.isDirectory(), entryPath)) {
                    zipInputStream.closeEntry();
                    continue;
                }

                String fileName = extractArchiveLeafName(entryPath);
                if (!isAllowedPaperFile(fileName)) {
                    zipInputStream.closeEntry();
                    continue;
                }

                paperEntries.add(new ArchivePaperEntry(entryPath, fileName, readCurrentZipEntry(zipInputStream)));
                zipInputStream.closeEntry();
            }
        }
        return paperEntries;
    }

    private List<ArchivePaperEntry> findPaperEntriesFromRar(InputStream inputStream) throws Exception {
        List<ArchivePaperEntry> paperEntries = new ArrayList<>();
        try (Archive archive = new Archive(inputStream)) {
            if (archive.isEncrypted() || archive.isPasswordProtected()) {
                throw new IllegalArgumentException("暂不支持带密码的 rar 压缩包");
            }
            for (FileHeader fileHeader : archive.getFileHeaders()) {
                String entryPath = normalizeArchiveEntryPath(fileHeader.getFileName());
                if (shouldSkipArchiveEntry(fileHeader.isDirectory(), entryPath)) {
                    continue;
                }

                String fileName = extractArchiveLeafName(entryPath);
                if (!isAllowedPaperFile(fileName)) {
                    continue;
                }

                try (InputStream entryInputStream = archive.getInputStream(fileHeader)) {
                    if (entryInputStream == null) {
                        continue;
                    }
                    paperEntries.add(new ArchivePaperEntry(entryPath, fileName, entryInputStream.readAllBytes()));
                }
            }
        } catch (UnsupportedRarV5Exception e) {
            throw new IllegalArgumentException("当前暂不支持 RAR5 格式压缩包，请重新压缩为 zip 或旧版 rar");
        } catch (UnsupportedRarEncryptedException e) {
            throw new IllegalArgumentException("暂不支持带密码的 rar 压缩包");
        }
        return paperEntries;
    }

    private byte[] readCurrentZipEntry(ZipInputStream zipInputStream) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int length;
        while ((length = zipInputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, length);
        }
        return outputStream.toByteArray();
    }

    private boolean shouldSkipArchiveEntry(boolean isDirectory, String entryPath) {
        if (isDirectory) return true;
        if (!StringUtils.hasText(entryPath)) return true;
        if (entryPath.startsWith("__MACOSX/")) return true;
        return Arrays.stream(entryPath.split("/"))
                .map(String::trim)
                .anyMatch(segment -> !StringUtils.hasText(segment) || segment.startsWith("."));
    }

    private String normalizeArchiveEntryPath(String entryName) {
        if (!StringUtils.hasText(entryName)) return "";
        return entryName.replace('\\', '/').trim();
    }

    private String extractArchiveLeafName(String entryPath) {
        if (!StringUtils.hasText(entryPath)) return "";
        int index = entryPath.lastIndexOf('/');
        return index >= 0 ? entryPath.substring(index + 1) : entryPath;
    }

    private StoredPaperAsset storePaperAsset(InputStream inputStream, String objectKeyPrefix, String storedNamePrefix, String originalFilename) throws Exception {
        byte[] fileBytes = inputStream.readAllBytes();
        String extension = getFileExtension(originalFilename).toLowerCase();
        String normalizedPrefix = objectKeyPrefix.endsWith("/") ? objectKeyPrefix : objectKeyPrefix + "/";
        String storedName = storedNamePrefix + extension;
        if (".pdf".equals(extension)) {
            storedName = storedNamePrefix + ".png";
            RenderResult result = renderPdfAsLongImage(fileBytes);
            String url = ossStorageService.uploadBytes(result.bytes(), normalizedPrefix + storedName, "image/png");
            return new StoredPaperAsset(url, result.mergeInfo());
        } else {
            String url = ossStorageService.uploadBytes(
                    fileBytes,
                    normalizedPrefix + storedName,
                    resolveContentTypeByExtension(extension)
            );
            return new StoredPaperAsset(url, buildSingleImageMergeInfo(fileBytes));
        }
    }

    private String getFileExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) return "";
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index) : "";
    }

    private String normalizeStoredPaperPreviewUrl(String url) {
        if (!StringUtils.hasText(url)) return url;
        url = ossStorageService.toCdnUrl(url);
        if (!isPdfFile(url)) return url;
        if (!ossStorageService.isOssUrl(url)) return url;

        try {
            byte[] pdfBytes = ossStorageService.download(url);
            RenderResult result = renderPdfAsLongImage(pdfBytes);
            String objectKey = ossStorageService.extractObjectKey(url);
            String previewKey = replaceFileExtension(objectKey, "_preview.png");
            return ossStorageService.uploadBytes(result.bytes(), previewKey, "image/png");
        } catch (Exception ignored) {
            return url;
        }
    }

    private RenderResult renderPdfAsLongImage(byte[] pdfBytes) throws Exception {
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            if (document.getNumberOfPages() <= 0) {
                throw new IllegalArgumentException("PDF 文件没有可渲染的页面");
            }

            PDFRenderer renderer = new PDFRenderer(document);
            List<BufferedImage> pageImages = new ArrayList<>();
            List<Map<String, Object>> pages = new ArrayList<>();
            int totalHeight = 0;
            int maxWidth = 0;
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage pageImage = renderer.renderImageWithDPI(i, PDF_RENDER_DPI, ImageType.RGB);
                pageImages.add(pageImage);
                totalHeight += pageImage.getHeight();
                maxWidth = Math.max(maxWidth, pageImage.getWidth());
            }

            BufferedImage combinedImage = new BufferedImage(maxWidth, totalHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = combinedImage.createGraphics();
            try {
                graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                graphics.setColor(Color.WHITE);
                graphics.fillRect(0, 0, maxWidth, totalHeight);

                int currentY = 0;
                for (int i = 0; i < pageImages.size(); i++) {
                    BufferedImage pageImage = pageImages.get(i);
                    int offsetX = Math.max((maxWidth - pageImage.getWidth()) / 2, 0);
                    graphics.drawImage(pageImage, offsetX, currentY, null);
                    pages.add(buildPageMergeInfo(
                            i + 1,
                            offsetX,
                            currentY,
                            pageImage.getWidth(),
                            pageImage.getHeight(),
                            maxWidth,
                            totalHeight
                    ));
                    currentY += pageImage.getHeight();
                }
            } finally {
                graphics.dispose();
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(combinedImage, "png", outputStream);
            return new RenderResult(outputStream.toByteArray(), buildPaperMergeInfo("pdf", maxWidth, totalHeight, pages));
        }
    }

    private Map<String, Object> derivePaperMergeInfo(String storedPaperUrl, Path previewPath) throws Exception {
        if (isPdfFile(storedPaperUrl)) {
            if (ossStorageService.isOssUrl(storedPaperUrl)) {
                byte[] pdfBytes = ossStorageService.download(storedPaperUrl);
                return renderPdfAsLongImage(pdfBytes).mergeInfo();
            }
        }
        return buildSingleImageMergeInfo(Files.readAllBytes(previewPath));
    }

    private Path resolvePaperPath(String url) {
        if (!StringUtils.hasText(url)) return null;
        if (ossStorageService.isOssUrl(url)) {
            try {
                return ossStorageService.downloadToTempFile(url);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private boolean isPdfFile(String fileName) {
        return StringUtils.hasText(fileName) && fileName.toLowerCase().endsWith(".pdf");
    }

    private String resolveContentTypeByExtension(String extension) {
        return switch (extension) {
            case ".png" -> "image/png";
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
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

        if (!uploadCtx.examClassMap().containsKey(student.getClassId())) return Result.error("学生所属班级未纳入本项目");

        String scoreKey = uploadCtx.subject().getId() + "_" + student.getStudentNo();
        ExamStudentScore score = prepareScoreRecord(uploadCtx.existingScoreMap().get(scoreKey), uploadCtx.subject(), student);
        
        double total = questionScores.stream().mapToDouble(v -> v == null ? 0D : v).sum();
        
        ExamProject project = examProjectRepository.findById(projectId).orElse(null);
        if (project != null) {
            Map<String, Object> benchmarks = map(project.getSubjectBenchmarks());
            Map<String, Object> benchmark = nestedMap(benchmarks.get(subjectName));
            Object totalScoreObj = benchmark.get("totalScore");
            if (totalScoreObj instanceof Number fullScoreNum) {
                double fullScore = fullScoreNum.doubleValue();
                if (total > fullScore + 0.01) {
                    return Result.error("保存失败：总分 (" + total + ") 超过学科满分 (" + fullScore + ")");
                }
            }
        }

        score.setTotalScore(total);
        score.setScoreEntered(Boolean.TRUE);
        try {
            score.setQuestionScores(objectMapper.writeValueAsString(questionScores));
        } catch (Exception ignored) {}

        examStudentScoreRepository.saveAndFlush(score);

        uploadCtx.subject().setScoreUploaded(Boolean.TRUE);
        examSubjectRepository.saveAndFlush(uploadCtx.subject());

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
            ExamSubject subject = findProjectSubjectByName(projectId, subjectName);
            if (subject == null) return Result.error("项目中无学科数据: " + subjectName);

            String oldUrl = "template".equals(type) ? subject.getAnswerUrl() : subject.getPaperUrl();

            StoredPaperAsset asset = storePublicPaperFile(file.getInputStream(), projectId, subjectName, type, originalFilename);
            String storedUrl = asset.url();

            if ("template".equals(type)) {
                subject.setAnswerUrl(storedUrl);
            } else {
                subject.setPaperUrl(storedUrl);
            }
            clearPaperLayout(subject, type);
            savePaperMergeInfo(subject, type, asset.mergeInfo());
            examSubjectRepository.saveAndFlush(subject);

            deletePaperAssetByUrl(oldUrl);

            return Result.success("上传成功", storedUrl);
        } catch (Exception e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getPaperConfig(String projectId, String subjectName) {
        forceFreshRead();
        if (!examProjectRepository.existsById(projectId)) return Result.error("项目不存在");
        ExamSubject subject = findProjectSubjectByName(projectId, subjectName);
        if (subject == null) return Result.success(new HashMap<>());

        Map<String, Object> config = new HashMap<>();
        config.put("templateUrl", null);
        config.put("originalUrl", null);

        try {
            PaperAssetContext templateContext = resolveOptionalPaperAssetContext(subject, "template", subject.getAnswerUrl(), true);
            PaperAssetContext originalContext = resolveOptionalPaperAssetContext(subject, "original", subject.getPaperUrl(), true);

            String templateUrl = templateContext != null ? templateContext.previewUrl() : normalizeStoredPaperPreviewUrl(subject.getAnswerUrl());
            String originalUrl = originalContext != null ? originalContext.previewUrl() : normalizeStoredPaperPreviewUrl(subject.getPaperUrl());

            boolean changed = false;
            if (!java.util.Objects.equals(templateUrl, subject.getAnswerUrl())) {
                subject.setAnswerUrl(templateUrl);
                changed = true;
            }
            if (!java.util.Objects.equals(originalUrl, subject.getPaperUrl())) {
                subject.setPaperUrl(originalUrl);
                changed = true;
            }
            if (templateContext != null && templateContext.mergeInfoChanged()) {
                subject.setAnswerMergeInfo(jsonMap(templateContext.mergeInfo()));
                changed = true;
            }
            if (originalContext != null && originalContext.mergeInfoChanged()) {
                subject.setPaperMergeInfo(jsonMap(originalContext.mergeInfo()));
                changed = true;
            }
            if (changed) {
                examSubjectRepository.saveAndFlush(subject);
            }

            config.put("templateUrl", templateUrl);
            config.put("originalUrl", originalUrl);
            config.put("templateMergeInfo", templateContext == null ? Collections.emptyMap() : templateContext.mergeInfo());
            config.put("originalMergeInfo", originalContext == null ? Collections.emptyMap() : originalContext.mergeInfo());
        } catch (Exception ex) {
            return Result.error("获取试卷配置失败: " + ex.getMessage());
        }

        config.put("templateRegions", regionList(mapList(subject.getAnswersLayouts())));
        config.put("originalRegions", regionList(mapList(subject.getPaperLayouts())));
        return Result.success(config);
    }

    @Override
    @Transactional
    public Result<Void> savePaperLayout(PaperLayoutSaveDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getProjectId())) return Result.error("项目ID不能为空");
        if (!StringUtils.hasText(dto.getSubjectName())) return Result.error("学科名称不能为空");
        if (!"template".equals(dto.getType()) && !"original".equals(dto.getType()) && !"student".equals(dto.getType())) {
            return Result.error("布局类型错误，仅支持 template、original 或 student");
        }
        ExamSubject subject = findProjectSubjectByName(dto.getProjectId(), dto.getSubjectName());
        if (subject == null) return Result.error("项目中无学科数据: " + dto.getSubjectName());

        List<Map<String, Object>> normalizedRegions = normalizeRegionDtos(dto.getRegions());
        if ("template".equals(dto.getType())) {
            subject.setAnswersLayouts(jsonValue(normalizedRegions));
            examSubjectRepository.saveAndFlush(subject);
            return Result.success("保存成功", null);
        }

        if ("original".equals(dto.getType())) {
            subject.setPaperLayouts(jsonValue(normalizedRegions));
            examSubjectRepository.saveAndFlush(subject);
            syncBenchmarkScoresFromOriginalLayout(dto.getProjectId(), dto.getSubjectName(), normalizedRegions);
            return Result.success("保存成功", null);
        }

        if (!StringUtils.hasText(dto.getStudentNo())) {
            return Result.error("保存考生原卷框选时缺少学号");
        }
        ExamStudentScore targetScore = findStudentScoreRecord(dto.getProjectId(), dto.getSubjectName(), dto.getStudentNo());
        if (targetScore == null) {
            return Result.error("未找到对应考生试卷记录: " + dto.getStudentNo());
        }
        targetScore.setAnswerSheetLayouts(jsonValue(normalizedRegions));
        examStudentScoreRepository.saveAndFlush(targetScore);

        if (Boolean.TRUE.equals(dto.getApplyToAllStudents())) {
            List<ExamStudentScore> subjectScores = examStudentScoreRepository.findBySubjectId(targetScore.getSubjectId());
            for (ExamStudentScore score : subjectScores) {
                score.setAnswerSheetLayouts(jsonValue(normalizedRegions));
            }
            examStudentScoreRepository.saveAllAndFlush(subjectScores);
        }
        return Result.success("保存成功", null);
    }

    @Override
    @Transactional
    public Result<Map<String, Object>> autoCutPaperLayoutByOcr(PaperOcrAutoCutDTO dto) {
        return autoCutPaperLayoutByOcr(dto, null);
    }

    private Result<Map<String, Object>> autoCutPaperLayoutByOcr(PaperOcrAutoCutDTO dto, String taskId) {
        if (dto == null || !StringUtils.hasText(dto.getProjectId())) return Result.error("项目ID不能为空");
        if (!StringUtils.hasText(dto.getSubjectName())) return Result.error("学科名称不能为空");
        if (!"template".equals(dto.getType()) && !"original".equals(dto.getType()) && !"student".equals(dto.getType())) {
            return Result.error("布局类型错误，仅支持 template、original 或 student");
        }

        if (!examProjectRepository.existsById(dto.getProjectId())) return Result.error("项目不存在");

        ExamSubject subject = findProjectSubjectByName(dto.getProjectId(), dto.getSubjectName());
        if (subject == null) {
            return Result.error("项目中无学科数据: " + dto.getSubjectName());
        }

        try {
            String paperUrl;
            if ("student".equals(dto.getType())) {
                if (!StringUtils.hasText(dto.getStudentNo())) {
                    return Result.error("识别考生答题卡时缺少学号");
                }
                ExamStudentScore studentScore = findStudentScoreRecord(dto.getProjectId(), dto.getSubjectName(), dto.getStudentNo());
                if (studentScore == null || !StringUtils.hasText(studentScore.getAnswerSheetUrl())) {
                    return Result.error("未找到对应考生试卷或考生未上传试卷");
                }
                paperUrl = studentScore.getAnswerSheetUrl();
            } else {
                paperUrl = "template".equals(dto.getType()) ? subject.getAnswerUrl() : subject.getPaperUrl();
            }

            if (taskId != null) ocrTasks.put(taskId, new OcrTaskStatus(taskId, "RUNNING", 15, "正在解析试卷资源...", null, System.currentTimeMillis()));
            PaperAssetContext paperContext = resolvePaperAssetContext(subject, dto.getType(), paperUrl, true);
            
            if (taskId != null) ocrTasks.put(taskId, new OcrTaskStatus(taskId, "RUNNING", 25, "正在执行分页面 OCR 识别...", null, System.currentTimeMillis()));
            OcrExecutionResult ocrExecutionResult = runPaperOcrByPages(
                    paperContext.paperPath(),
                    paperContext.previewUrl(),
                    paperContext.mergeInfo(),
                    dto.getSubjectName(),
                    dto.getImageType(),
                    resolveOcrCutType(dto.getType())
            );
            List<Map<String, Object>> regions = regionList(ocrExecutionResult.regions());
            if (regions.isEmpty()) {
                return Result.error("AI识别未识别出可切割的题目区域");
            }
            if ("original".equals(dto.getType())) {
                if (taskId != null) ocrTasks.put(taskId, new OcrTaskStatus(taskId, "RUNNING", 75, "正在识别知识点/分数...", null, System.currentTimeMillis()));
                regions = enrichRegionsWithLlmMeta(regions);
            }

            if (taskId != null) ocrTasks.put(taskId, new OcrTaskStatus(taskId, "RUNNING", 95, "正在保存识别结果...", null, System.currentTimeMillis()));
            if ("template".equals(dto.getType())) {
                subject.setAnswersLayouts(jsonValue(regions));
                examSubjectRepository.saveAndFlush(subject);
            } else if ("original".equals(dto.getType())) {
                subject.setPaperLayouts(jsonValue(regions));
                examSubjectRepository.saveAndFlush(subject);
            } else if ("student".equals(dto.getType())) {
                ExamStudentScore studentScore = findStudentScoreRecord(dto.getProjectId(), dto.getSubjectName(), dto.getStudentNo());
                if (studentScore != null) {
                    studentScore.setAnswerSheetLayouts(jsonValue(regions));
                    examStudentScoreRepository.saveAndFlush(studentScore);
                }
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("projectId", dto.getProjectId());
            data.put("subjectName", dto.getSubjectName());
            data.put("type", dto.getType());
            data.put("paperUrl", paperContext.previewUrl());
            data.put("requestId", ocrExecutionResult.requestId());
            data.put("ocrSubject", ocrExecutionResult.ocrSubject());
            data.put("imageType", ocrExecutionResult.imageType());
            data.put("cutType", ocrExecutionResult.cutType());
            data.put("pageCount", ocrExecutionResult.pageCount());
            data.put("pageResults", ocrExecutionResult.pageResults());
            data.put("recognizedCount", regions.size());
            data.put("regions", regions);
            return Result.success("AI识别完成", data);
        } catch (IllegalArgumentException ex) {
            return Result.error(ex.getMessage());
        } catch (Exception ex) {
            log.error("AI识别失败: {}", ex.getMessage(), ex);
            return Result.error("AI识别失败: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Map<String, Object>> ocrPaperLayoutPage(PaperOcrAutoCutDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getProjectId())) return Result.error("项目ID不能为空");
        if (!StringUtils.hasText(dto.getSubjectName())) return Result.error("学科名称不能为空");
        if (!"template".equals(dto.getType()) && !"original".equals(dto.getType()) && !"student".equals(dto.getType())) {
            return Result.error("布局类型错误，仅支持 template、original 或 student");
        }
        if (dto.getPageIndex() == null || dto.getPageIndex() <= 0) {
            return Result.error("页码不能为空");
        }

        if (!examProjectRepository.existsById(dto.getProjectId())) return Result.error("项目不存在");

        ExamSubject subject = findProjectSubjectByName(dto.getProjectId(), dto.getSubjectName());
        if (subject == null) {
            return Result.error("项目中无学科数据: " + dto.getSubjectName());
        }

        try {
            String paperUrl;
            if ("student".equals(dto.getType())) {
                if (!StringUtils.hasText(dto.getStudentNo())) {
                    return Result.error("识别考生答题卡时缺少学号");
                }
                ExamStudentScore studentScore = findStudentScoreRecord(dto.getProjectId(), dto.getSubjectName(), dto.getStudentNo());
                if (studentScore == null || !StringUtils.hasText(studentScore.getAnswerSheetUrl())) {
                    return Result.error("未找到对应考生试卷或考生未上传试卷");
                }
                paperUrl = studentScore.getAnswerSheetUrl();
            } else {
                paperUrl = "template".equals(dto.getType()) ? subject.getAnswerUrl() : subject.getPaperUrl();
            }

            PaperAssetContext paperContext = resolvePaperAssetContext(subject, dto.getType(), paperUrl, true);
            Map<String, Object> pageResult = runSinglePaperOcrPage(
                    paperContext.paperPath(),
                    paperContext.previewUrl(),
                    paperContext.mergeInfo(),
                    dto.getPageIndex(),
                    dto.getSubjectName(),
                    dto.getImageType(),
                    resolveOcrCutType(dto.getType())
            );
            
            if ("student".equals(dto.getType())) {
                ExamStudentScore studentScore = findStudentScoreRecord(dto.getProjectId(), dto.getSubjectName(), dto.getStudentNo());
                if (studentScore != null) {
                    mergeStudentPagedLayoutResult(
                            studentScore,
                            dto.getPageIndex(),
                            paperContext.mergeInfo(),
                            nestedMap(pageResult.get("pageInfo")),
                            mapList(pageResult.get("regions"))
                    );
                    examStudentScoreRepository.saveAndFlush(studentScore);
                }
            } else {
                mergePagedLayoutResult(
                        subject,
                        dto.getType(),
                        dto.getPageIndex(),
                        paperContext.mergeInfo(),
                        nestedMap(pageResult.get("pageInfo")),
                        mapList(pageResult.get("regions"))
                );
                if ("original".equals(dto.getType())) {
                    int totalPages = Math.max(asInt(paperContext.mergeInfo().get("pageCount"), 0), mapList(paperContext.mergeInfo().get("pages")).size());
                    if (dto.getPageIndex() >= totalPages) {
                        List<Map<String, Object>> mergedRegions = enrichRegionsWithLlmMeta(regionList(mapList(subject.getPaperLayouts())));
                        subject.setPaperLayouts(jsonValue(mergedRegions));
                    }
                }
                examSubjectRepository.saveAndFlush(subject);
            }
            return Result.success("分页识别完成", pageResult);
        } catch (IllegalArgumentException ex) {
            return Result.error(ex.getMessage());
        } catch (Exception ex) {
            return Result.error("分页识别失败: " + ex.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> ocrPaperRegion(PaperRegionOcrDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getProjectId())) return Result.error("项目ID不能为空");
        if (!StringUtils.hasText(dto.getSubjectName())) return Result.error("学科名称不能为空");
        if (!"template".equals(dto.getType()) && !"original".equals(dto.getType()) && !"student".equals(dto.getType())) {
            return Result.error("布局类型错误，仅支持 template、original 或 student");
        }
        if (dto.getWidth() == null || dto.getWidth() <= 0 || dto.getHeight() == null || dto.getHeight() <= 0) {
            return Result.error("题框坐标无效");
        }

        if (!examProjectRepository.existsById(dto.getProjectId())) return Result.error("项目不存在");

        ExamSubject subject = findProjectSubjectByName(dto.getProjectId(), dto.getSubjectName());
        if (subject == null) {
            return Result.error("项目中无学科数据: " + dto.getSubjectName());
        }

        Path tempPath = null;
        try {
            PaperAssetContext paperContext = resolvePaperAssetContextForRegion(subject, dto);
            tempPath = cropRegionToTempImage(
                    paperContext.paperPath(),
                    clampRatio(dto.getX()),
                    clampRatio(dto.getY()),
                    clampRatio(dto.getWidth()),
                    clampRatio(dto.getHeight())
            );
            AliyunPaperOcrService.QuestionOcrResult ocrResult = aliyunPaperOcrService.recognizeQuestion(tempPath);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("questionText", str(ocrResult.getQuestionText()).trim());
            data.put("questionType", str(ocrResult.getQuestionType()).trim());
            data.put("score", ocrResult.getScore());
            return Result.success("识别完成", data);
        } catch (Exception ex) {
            return Result.error("题目识别失败: " + ex.getMessage());
        } finally {
            deleteTempFile(tempPath);
        }
    }

    @Override
    public Result<Map<String, Object>> analyzePaperRegion(PaperRegionOcrDTO dto) {
        Result<Map<String, Object>> ocrResult = ocrPaperRegion(dto);
        if (ocrResult.getCode() != 200 || ocrResult.getData() == null) {
            return ocrResult;
        }
        String questionText = asString(ocrResult.getData().get("questionText")).trim();
        if (!StringUtils.hasText(questionText)) {
            return Result.error("OCR 未识别到有效题目文本");
        }
        try {
            Map<String, Object> analysis = analyzeQuestionMetaByLlm(questionText, dto.getPartTitle());
            Map<String, Object> data = new LinkedHashMap<>(ocrResult.getData());
            if (analysis.get("questionText") instanceof String llmQuestionText && StringUtils.hasText(llmQuestionText)) {
                data.put("questionText", llmQuestionText.trim());
            }
            data.put("knowledgePoint", asString(analysis.get("knowledgePoint")).trim());
            data.put("score", nullableRounded(analysis.get("score")));
            data.put("analysis", analysis);
            return Result.success("分析完成", data);
        } catch (Exception ex) {
            return Result.error("题目分析失败: " + ex.getMessage());
        }
    }

    private PaperAssetContext resolvePaperAssetContextForRegion(ExamSubject subject, PaperRegionOcrDTO dto) throws Exception {
        if ("student".equals(dto.getType())) {
            if (!StringUtils.hasText(dto.getStudentNo())) {
                throw new IllegalArgumentException("考生原卷识别缺少学号");
            }
            ExamStudentScore score = findStudentScoreRecord(subject.getProjectId(), subject.getSubjectName(), dto.getStudentNo());
            if (score == null || !StringUtils.hasText(score.getAnswerSheetUrl())) {
                throw new IllegalArgumentException("当前考生未上传原卷");
            }
            return resolveStudentPaperAssetContext(score, true);
        }
        String paperUrl = "template".equals(dto.getType()) ? subject.getAnswerUrl() : subject.getPaperUrl();
        return resolvePaperAssetContext(subject, dto.getType(), paperUrl, true);
    }

    private PaperAssetContext resolveStudentPaperAssetContext(ExamStudentScore score, boolean persistIfMissing) throws Exception {
        if (score == null || !StringUtils.hasText(score.getAnswerSheetUrl())) {
            throw new IllegalArgumentException("考生原卷不存在");
        }
        return resolvePaperAssetContext(
                score.getAnswerSheetUrl(),
                score.getAnswerMergeInfo(),
                persistIfMissing,
                (previewUrl, mergeInfoJson) -> {
                    score.setAnswerSheetUrl(previewUrl);
                    score.setAnswerMergeInfo(mergeInfoJson);
                }
        );
    }

    private PaperAssetContext resolvePaperAssetContext(
            String storedPaperUrl,
            String mergeInfoJson,
            boolean persistIfMissing,
            java.util.function.BiConsumer<String, String> updater) throws Exception {
        if (!StringUtils.hasText(storedPaperUrl)) {
            throw new IllegalArgumentException("试卷资源不存在，请先上传");
        }
        Path storedPath = resolvePaperPath(storedPaperUrl);
        if (storedPath == null || !Files.exists(storedPath)) {
            throw new IllegalArgumentException("试卷文件不存在，请重新上传");
        }

        Map<String, Object> mergeInfo = resolvePaperMergeInfoFromJson(mergeInfoJson);
        String previewUrl = normalizeStoredPaperPreviewUrl(storedPaperUrl);
        boolean mergeInfoChanged = false;
        Path previewPath = resolvePaperPath(previewUrl);
        if (previewPath == null || !Files.exists(previewPath)) {
            throw new IllegalArgumentException("试卷文件不存在，请重新上传");
        }
        if (!hasValidPaperMergeInfo(mergeInfo)) {
            mergeInfo = derivePaperMergeInfo(storedPaperUrl, previewPath);
            mergeInfoChanged = true;
            if (persistIfMissing && updater != null) {
                updater.accept(previewUrl, jsonMap(mergeInfo));
            }
        }
        return new PaperAssetContext(previewUrl, previewPath, mergeInfo, mergeInfoChanged);
    }

    private Map<String, Object> resolvePaperMergeInfoFromJson(String mergeInfoJson) {
        Map<String, Object> mergeInfo = map(mergeInfoJson);
        return mergeInfo.isEmpty() ? Collections.emptyMap() : mergeInfo;
    }

    private ExamStudentScore findStudentScoreRecord(String projectId, String subjectName, String studentNo) {
        if (!StringUtils.hasText(projectId) || !StringUtils.hasText(subjectName) || !StringUtils.hasText(studentNo)) {
            return null;
        }
        ExamSubject subject = findProjectSubjectByName(projectId, subjectName);
        if (subject == null) {
            return null;
        }
        return examStudentScoreRepository.findBySubjectIdAndStudentNo(subject.getId(), normalizeStudentNo(studentNo)).orElse(null);
    }

    private void syncBenchmarkScoresFromOriginalLayout(String projectId, String subjectName, List<Map<String, Object>> regions) {
        if (!StringUtils.hasText(projectId) || !StringUtils.hasText(subjectName) || regions == null) {
            return;
        }
        ExamProject project = examProjectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return;
        }

        Map<String, Object> benchmarks = new LinkedHashMap<>(map(project.getSubjectBenchmarks()));
        Map<String, Object> subjectBenchmark = new LinkedHashMap<>(nestedMap(benchmarks.get(subjectName)));
        List<Map<String, Object>> questions = new ArrayList<>(mapList(subjectBenchmark.get("questions")));

        for (Map<String, Object> region : regions) {
            Integer questionIndex = extractQuestionIndex(asString(region.get("questionNo")));
            Double score = nullableRounded(region.get("score"));
            if (questionIndex == null || questionIndex <= 0 || score == null) {
                continue;
            }
            while (questions.size() < questionIndex) {
                questions.add(new LinkedHashMap<>(Map.of("score", 0D)));
            }
            Map<String, Object> question = new LinkedHashMap<>(nestedMap(questions.get(questionIndex - 1)));
            question.put("score", score);
            questions.set(questionIndex - 1, question);
        }

        subjectBenchmark.put("questions", questions);
        benchmarks.put(subjectName, subjectBenchmark);
        project.setSubjectBenchmarks(jsonMap(benchmarks));
        examProjectRepository.saveAndFlush(project);
    }

    private Integer extractQuestionIndex(String questionNo) {
        String normalized = normalizeQuestionNo(questionNo, 0);
        Matcher matcher = QUESTION_NUMBER_PATTERN.matcher(normalized);
        if (!matcher.find()) {
            return null;
        }
        return parseIntSafe(matcher.group(1));
    }

    private Map<String, Object> analyzeQuestionMetaByLlm(String questionText, String partTitle) {
        if (!StringUtils.hasText(globalConfigProperties.getQwenApiKey()) || !StringUtils.hasText(globalConfigProperties.getQwenChatUrl())) {
            throw new IllegalStateException("大模型配置缺失，请先配置 Qwen API");
        }
        try {
            String userPrompt = "请分析以下题目文本并返回 JSON：\n" + questionText;
            if (StringUtils.hasText(partTitle)) {
                userPrompt = "题目所在大题说明：" + partTitle + "\n\n" + userPrompt;
            }

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", resolveQwenModel());
            requestBody.put("enable_thinking", false);
            requestBody.put("temperature", 0.1);
            requestBody.put("response_format", Map.of("type", "json_object"));
            requestBody.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", """
                                    你是一名严谨的中小学试题分析助手。
                                    你需要从 OCR 题目文本中提取并规范化以下信息，并严格输出 JSON：
                                    {
                                      "questionText": "string",
                                      "knowledgePoint": "string",
                                      "score": 0.0
                                    }
                                    要求：
                                    1. score 必须是数字（浮点数）。
                                    2. 必须参考提供的“大题说明”（如“每小题3分”）来确定分值。
                                    3. 如果题目文本中明确标注了该题的分值（如“本题5分”），以题目文本为准。
                                    4. 如果大题说明和题目文本都没有分值，且无法通过题型判断，请默认返回 0.0。
                                    5. knowledgePoint 用简洁中文概括主要知识点，多个知识点用顿号分隔。
                                    6. questionText 返回识别出的纯净题干文本，去除冗余的题号。
                                    7. 不要输出 markdown，不要解释。
                                    """
                    ),
                    Map.of(
                            "role", "user",
                            "content", userPrompt
                    )
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(globalConfigProperties.getQwenChatUrl()))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + globalConfigProperties.getQwenApiKey().trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(writeJson(requestBody), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("大模型调用失败，HTTP状态码：" + response.statusCode());
            }

            Map<String, Object> root = readJsonMap(response.body());
            List<Map<String, Object>> choices = mapList(root.get("choices"));
            Map<String, Object> firstChoice = choices.isEmpty() ? Collections.emptyMap() : choices.get(0);
            String content = asString(nestedMap(firstChoice.get("message")).get("content")).trim();
            if (!StringUtils.hasText(content)) {
                throw new IllegalStateException("大模型未返回有效内容");
            }
            return readJsonMap(content);
        } catch (Exception ex) {
            throw new IllegalStateException("大模型分析失败: " + ex.getMessage(), ex);
        }
    }

    private List<Map<String, Object>> enrichRegionsWithLlmMeta(List<Map<String, Object>> regions) {
        if (regions == null || regions.isEmpty()) {
            return Collections.emptyList();
        }
        if (!StringUtils.hasText(globalConfigProperties.getQwenApiKey()) || !StringUtils.hasText(globalConfigProperties.getQwenChatUrl())) {
            log.warn("Qwen 配置缺失，跳过原卷识别后的分值/知识点分析");
            return regions;
        }
        try {
            Map<String, Map<String, String>> questionDataMap = new LinkedHashMap<>();
            Set<String> partTitles = new LinkedHashSet<>();
            for (Map<String, Object> region : regions) {
                String questionNo = normalizeQuestionNo(asString(region.get("questionNo")), asInt(region.get("sortOrder"), 1));
                String questionText = asString(region.get("questionText")).trim();
                String partTitle = asString(region.get("partTitle")).trim();
                if (!StringUtils.hasText(questionText)) {
                    continue;
                }
                
                Map<String, String> data = questionDataMap.computeIfAbsent(questionNo, k -> new HashMap<>());
                data.merge("text", questionText, (left, right) -> left + "\n" + right);
                if (StringUtils.hasText(partTitle)) {
                    data.put("partTitle", partTitle);
                    partTitles.add(partTitle);
                }
            }
            if (questionDataMap.isEmpty()) {
                return regions;
            }

            String userContent = "这是整份试卷（所有页面）合并后的完整题目数据，请结合大题说明进行全卷分析：\n";
            if (!partTitles.isEmpty()) {
                userContent = "【试卷大题结构说明】\n" + String.join("\n", partTitles) + "\n\n" + userContent;
            }
            userContent += writeJson(questionDataMap);

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", resolveQwenModel());
            requestBody.put("enable_thinking", false);
            requestBody.put("temperature", 0.1);
            requestBody.put("response_format", Map.of("type", "json_object"));
            requestBody.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", """
                                    你是一名专业的中小学试卷全卷分析专家。
                                    我会给你整份试卷（包含所有页面）按题号归纳后的完整 OCR 文本，以及试卷的大题结构说明。
                                    你需要对全卷题目进行统一分析，并输出严格 JSON：
                                    {
                                      "questions": [
                                        {
                                          "questionNo": "第1题",
                                          "score": 0.0,
                                          "knowledgePoint": "字符串"
                                        }
                                      ]
                                    }
                                    要求：
                                    1. 必须覆盖输入 JSON 中出现的所有题号。
                                    2. score 返回数字（浮点数）。
                                    3. 必须严格遵守大题说明中的分值规则（如“一、选择题...每小题3分”则该大题下所有小题均为3分）。
                                    4. 如果题目文本中有冲突的明确分值（如“本题5分”），以题目文本为准。
                                    5. 如果都无法判断分值，请默认返回 0.0。
                                    6. knowledgePoint 用中文简洁概括核心知识点。
                                    7. 不要输出任何 markdown 或解释性文字，只输出 JSON。
                                    """
                    ),
                    Map.of(
                            "role", "user",
                            "content", userContent
                    )
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(globalConfigProperties.getQwenChatUrl()))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + globalConfigProperties.getQwenApiKey().trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(writeJson(requestBody), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("大模型调用失败，HTTP状态码：" + response.statusCode());
            }

            Map<String, Object> root = readJsonMap(response.body());
            System.out.println("大模型调用响应: " + requestBody.get("messages"));
            List<Map<String, Object>> choices = mapList(root.get("choices"));
            Map<String, Object> firstChoice = choices.isEmpty() ? Collections.emptyMap() : choices.get(0);
            String content = asString(nestedMap(firstChoice.get("message")).get("content")).trim();
            if (!StringUtils.hasText(content)) {
                return regions;
            }

            Map<String, Object> parsed = readJsonMap(content);
            Map<String, Map<String, Object>> metaByQuestionNo = mapList(parsed.get("questions")).stream()
                    .collect(Collectors.toMap(
                            item -> normalizeQuestionNo(asString(item.get("questionNo")), 0),
                            item -> item,
                            (left, right) -> left,
                            LinkedHashMap::new
                    ));

            List<Map<String, Object>> enriched = new ArrayList<>();
            for (Map<String, Object> region : regions) {
                Map<String, Object> row = new LinkedHashMap<>(region);
                String questionNo = normalizeQuestionNo(asString(region.get("questionNo")), asInt(region.get("sortOrder"), 1));
                Map<String, Object> meta = metaByQuestionNo.get(questionNo);
                if (meta != null) {
                    row.put("knowledgePoint", asString(meta.get("knowledgePoint")).trim());
                    row.put("score", nullableRounded(meta.get("score")));
                }
                enriched.add(row);
            }
            return enriched;
        } catch (Exception ex) {
            log.warn("原卷识别后的题目分值/知识点分析失败: {}", ex.getMessage());
            return regions;
        }
    }

    private String resolveQwenModel() {
        return StringUtils.hasText(globalConfigProperties.getQwenModel())
                ? globalConfigProperties.getQwenModel().trim()
                : "qwen-plus";
    }

    private ExamSubject findProjectSubjectByName(String projectId, String subjectName) {
        return examSubjectRepository.findFirstByProjectIdAndSubjectName(projectId, subjectName).orElse(null);
    }

    private StoredPaperAsset storePublicPaperFile(InputStream inputStream, String projectId, String subjectName, String type, String originalFilename) throws Exception {
        String storedNamePrefix = type + "_" + System.currentTimeMillis();
        return storePaperAsset(
                inputStream,
                "papers/exam-projects/" + safePathSegment(projectId) + "/" +
                        safePathSegment(subjectName) + "/public/",
                storedNamePrefix,
                originalFilename
        );
    }

    private Map<String, Object> buildSingleImageMergeInfo(byte[] fileBytes) throws Exception {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(fileBytes));
        if (image == null) throw new IllegalArgumentException("图片读取失败");
        int width = image.getWidth();
        int height = image.getHeight();
        return buildPaperMergeInfo(
                "image",
                width,
                height,
                List.of(buildPageMergeInfo(1, 0, 0, width, height, width, height))
        );
    }

    private Map<String, Object> buildPaperMergeInfo(String sourceType, int imageWidth, int imageHeight, List<Map<String, Object>> pages) {
        Map<String, Object> mergeInfo = new LinkedHashMap<>();
        mergeInfo.put("sourceType", sourceType);
        mergeInfo.put("imageWidth", imageWidth);
        mergeInfo.put("imageHeight", imageHeight);
        mergeInfo.put("pageCount", pages == null ? 0 : pages.size());
        mergeInfo.put("pages", pages == null ? Collections.emptyList() : pages);
        return mergeInfo;
    }

    private Map<String, Object> buildPageMergeInfo(
            int pageIndex,
            int offsetX,
            int offsetY,
            int width,
            int height,
            int imageWidth,
            int imageHeight) {
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("pageIndex", pageIndex);
        page.put("offsetX", offsetX);
        page.put("offsetY", offsetY);
        page.put("width", width);
        page.put("height", height);
        page.put("xRatio", imageWidth <= 0 ? 0D : clampRatio(offsetX * 1D / imageWidth));
        page.put("yRatio", imageHeight <= 0 ? 0D : clampRatio(offsetY * 1D / imageHeight));
        page.put("widthRatio", imageWidth <= 0 ? 1D : clampRatio(width * 1D / imageWidth));
        page.put("heightRatio", imageHeight <= 0 ? 1D : clampRatio(height * 1D / imageHeight));
        return page;
    }

    private List<Map<String, Object>> normalizeOcrRegions(List<Map<String, Object>> regions) {
        List<Map<String, Object>> normalized = new ArrayList<>();
        int index = 1;
        for (Map<String, Object> region : regions) {
            Map<String, Object> row = new LinkedHashMap<>(region);
            row.put("sortOrder", index);
            row.put("questionNo", normalizeQuestionNo(asString(row.get("questionNo")), index));
            normalized.add(row);
            index++;
        }
        return normalized;
    }

    private Path cropRegionToTempImage(Path paperPath, double xRatio, double yRatio, double widthRatio, double heightRatio) throws Exception {
        BufferedImage image = readImage(paperPath);
        int x = Math.min((int) Math.floor(xRatio * image.getWidth()), Math.max(image.getWidth() - 1, 0));
        int y = Math.min((int) Math.floor(yRatio * image.getHeight()), Math.max(image.getHeight() - 1, 0));
        int width = Math.max((int) Math.ceil(widthRatio * image.getWidth()), 1);
        int height = Math.max((int) Math.ceil(heightRatio * image.getHeight()), 1);
        width = Math.min(width, image.getWidth() - x);
        height = Math.min(height, image.getHeight() - y);
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("题框坐标超出试卷范围");
        }
        BufferedImage cropped = image.getSubimage(x, y, width, height);
        return writeBufferedImageToTemp(cropped, "paper-question");
    }

    private BufferedImage readImage(Path imagePath) throws Exception {
        BufferedImage image = ImageIO.read(imagePath.toFile());
        if (image == null) {
            throw new IllegalArgumentException("试卷图片读取失败");
        }
        return image;
    }

    private Path writeBufferedImageToTemp(BufferedImage image, String prefix) throws Exception {
        Path tempPath = Files.createTempFile(prefix + "_", ".png");
        ImageIO.write(image, "png", tempPath.toFile());
        return tempPath;
    }

    private void deleteTempFile(Path tempPath) {
        if (tempPath == null) {
            return;
        }
        try {
            Files.deleteIfExists(tempPath);
        } catch (Exception ignored) {
        }
    }

    private void clearPaperLayout(ExamSubject subject, String type) {
        if (subject == null || !StringUtils.hasText(type)) {
            return;
        }
        if ("template".equals(type)) {
            subject.setAnswersLayouts("[]");
        } else {
            subject.setPaperLayouts("[]");
        }
    }

    private void deletePaperAssetByUrl(String url) {
        if (!StringUtils.hasText(url)) return;
        try {
            if (ossStorageService.isOssUrl(url)) {
                ossStorageService.delete(url);
                if (url.toLowerCase().endsWith(".pdf")) {
                    String previewUrl = replaceFileExtension(url, "_preview.png");
                    ossStorageService.delete(previewUrl);
                }
            } else {
                Path filePath = resolvePaperPath(url);
                if (filePath != null) {
                    Files.deleteIfExists(filePath);
                }
            }
        } catch (Exception ignored) {
        }
    }

    private String replaceFileExtension(String fileName, String newExtension) {
        if (!StringUtils.hasText(fileName)) return "";
        int index = fileName.lastIndexOf('.');
        return (index >= 0 ? fileName.substring(0, index) : fileName) + newExtension;
    }

    private String toPaperUrl(Path path) {
        if (path == null) return "";
        String paperDir = globalConfigProperties.getPaperDir();
        String pathStr = path.toString().replace('\\', '/');
        String dirStr = Paths.get(paperDir).toString().replace('\\', '/');
        if (pathStr.startsWith(dirStr)) {
            String relative = pathStr.substring(dirStr.length());
            return "/uploads/papers" + (relative.startsWith("/") ? "" : "/") + relative;
        }
        return "";
    }

    private String resolveOcrCutType(String type) {
        return ("template".equals(type) || "student".equals(type)) ? "answer" : "question";
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

    private String jsonValue(Object value) {
        if (value == null) return "[]";
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception ignored) { return "[]"; }
    }

    private Map<String, Object> map(String json) {
        if (!StringUtils.hasText(json)) return Collections.emptyMap();
        try { return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception ignored) { return Collections.emptyMap(); }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> nestedMap(Object value) {
        if (value instanceof Map<?, ?> mapValue) {
            Map<String, Object> nested = new LinkedHashMap<>();
            mapValue.forEach((key, val) -> nested.put(String.valueOf(key), val));
            return nested;
        }
        return Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> mapList(Object value) {
        if (value instanceof String textValue && StringUtils.hasText(textValue)) {
            try {
                Object parsed = objectMapper.readValue(textValue, Object.class);
                return mapList(parsed);
            } catch (Exception ignored) {
                return Collections.emptyList();
            }
        }
        if (!(value instanceof Collection<?> collection)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : collection) {
            if (item instanceof Map<?, ?> mapValue) {
                Map<String, Object> row = new LinkedHashMap<>();
                mapValue.forEach((key, val) -> row.put(String.valueOf(key), val));
                rows.add(row);
            }
        }
        return rows;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> regionList(Object value) {
        if (!(value instanceof Collection<?> collection)) return Collections.emptyList();
        List<Map<String, Object>> rows = new ArrayList<>();
        int index = 1;
        for (Object item : collection) {
            if (!(item instanceof Map<?, ?> mapValue)) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            String regionId = asString(mapValue.get("id"));
            row.put("id", StringUtils.hasText(regionId) ? regionId : id("PR"));
            row.put("questionNo", normalizeQuestionNo(asString(mapValue.get("questionNo")), index));
            row.put("questionType", str(asString(mapValue.get("questionType"))));
            row.put("partTitle", str(asString(mapValue.get("partTitle"))));
            row.put("knowledgePoint", str(asString(mapValue.get("knowledgePoint"))));
            row.put("questionText", normalizeQuestionText(mapValue.get("questionText"), mapValue.get("remark")));
            row.put("score", nullableRounded(mapValue.get("score")));
            row.put("sortOrder", mapValue.get("sortOrder") instanceof Number number ? number.intValue() : index);
            row.put("x", clampRatio(mapValue.get("x")));
            row.put("y", clampRatio(mapValue.get("y")));
            row.put("width", clampRatio(mapValue.get("width")));
            row.put("height", clampRatio(mapValue.get("height")));
            rows.add(row);
            index++;
        }
        rows.sort(Comparator.comparing(item -> item.get("sortOrder") instanceof Number number ? number.intValue() : Integer.MAX_VALUE));
        return rows;
    }

    private List<Map<String, Object>> normalizeRegionDtos(List<PaperLayoutSaveDTO.PaperRegionDTO> regions) {
        if (regions == null) return Collections.emptyList();
        List<Map<String, Object>> rows = new ArrayList<>();
        int index = 1;
        for (PaperLayoutSaveDTO.PaperRegionDTO item : regions) {
            if (item == null) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            int sortOrder = item.getSortOrder() == null ? index : item.getSortOrder();
            row.put("id", StringUtils.hasText(item.getId()) ? item.getId().trim() : id("PR"));
            row.put("questionNo", normalizeQuestionNo(item.getQuestionNo(), sortOrder));
            row.put("questionType", str(item.getQuestionType()).trim());
            row.put("partTitle", str(item.getPartTitle()).trim());
            row.put("knowledgePoint", str(item.getKnowledgePoint()).trim());
            row.put("questionText", normalizeQuestionText(item.getQuestionText(), null));
            row.put("score", item.getScore() == null ? null : round(item.getScore()));
            row.put("sortOrder", sortOrder);
            row.put("x", clampRatio(item.getX()));
            row.put("y", clampRatio(item.getY()));
            row.put("width", clampRatio(item.getWidth()));
            row.put("height", clampRatio(item.getHeight()));
            rows.add(row);
            index++;
        }
        rows.sort(Comparator.comparing(item -> item.get("sortOrder") instanceof Number number ? number.intValue() : Integer.MAX_VALUE));
        return rows;
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
    private String asString(Object value) { return value == null ? "" : String.valueOf(value); }
    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("JSON序列化失败: " + ex.getMessage(), ex);
        }
    }
    private Map<String, Object> readJsonMap(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyMap();
        }
        json = json.trim();
        if (json.startsWith("```json")) {
            json = json.substring(7);
        } else if (json.startsWith("```")) {
            json = json.substring(3);
        }
        if (json.endsWith("```")) {
            json = json.substring(0, json.length() - 3);
        }
        json = json.trim();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new IllegalStateException("JSON解析失败: " + ex.getMessage(), ex);
        }
    }
    private String normalizeQuestionText(Object questionText, Object legacyRemark) {
        String resolved = asString(questionText).trim();
        if (StringUtils.hasText(resolved)) {
            return resolved;
        }
        return asString(legacyRemark).trim();
    }
    private String normalizeQuestionNo(String value, int fallbackIndex) {
        String raw = str(value).trim();
        if (!StringUtils.hasText(raw)) {
            return formatQuestionNo(null, fallbackIndex);
        }
        Matcher matcher = QUESTION_NUMBER_PATTERN.matcher(raw);
        if (matcher.find()) {
            return formatQuestionNo(parseIntSafe(matcher.group(1)), fallbackIndex);
        }
        Integer chineseNumber = parseChineseQuestionNumber(raw);
        if (chineseNumber != null && chineseNumber > 0) {
            return formatQuestionNo(chineseNumber, fallbackIndex);
        }
        String fallback = formatQuestionNo(null, fallbackIndex);
        return StringUtils.hasText(fallback) ? fallback : raw;
    }

    private String formatQuestionNo(Integer number, int fallbackIndex) {
        Integer target = number != null && number > 0 ? number : (fallbackIndex > 0 ? fallbackIndex : null);
        return target == null ? "" : "第" + target + "题";
    }

    private Integer parseChineseQuestionNumber(String raw) {
        String normalized = raw.replaceAll("[题号第\\s()（）【】\\[\\]、.．-]", "");
        if (!StringUtils.hasText(normalized) || !normalized.matches("[零〇一二两三四五六七八九十百]+")) {
            return null;
        }
        int result = 0;
        int current = 0;
        for (char ch : normalized.toCharArray()) {
            if (ch == '百') {
                result += (current == 0 ? 1 : current) * 100;
                current = 0;
                continue;
            }
            if (ch == '十') {
                result += (current == 0 ? 1 : current) * 10;
                current = 0;
                continue;
            }
            Integer digit = chineseDigit(ch);
            if (digit == null) return null;
            current = digit;
        }
        int value = result + current;
        return value > 0 ? value : null;
    }

    private Integer chineseDigit(char ch) {
        return switch (ch) {
            case '零', '〇' -> 0;
            case '一' -> 1;
            case '二', '两' -> 2;
            case '三' -> 3;
            case '四' -> 4;
            case '五' -> 5;
            case '六' -> 6;
            case '七' -> 7;
            case '八' -> 8;
            case '九' -> 9;
            default -> null;
        };
    }

    private Integer parseIntSafe(String value) {
        try { return Integer.parseInt(value); }
        catch (Exception ignored) { return null; }
    }
    private Double nullableRounded(Object value) {
        if (value == null || !StringUtils.hasText(String.valueOf(value))) return null;
        try { return round(Double.parseDouble(String.valueOf(value))); }
        catch (Exception ignored) { return null; }
    }
    private double clampRatio(Object value) {
        double ratio = 0D;
        if (value instanceof Number number) {
            ratio = number.doubleValue();
        } else if (value != null && StringUtils.hasText(String.valueOf(value))) {
            try { ratio = Double.parseDouble(String.valueOf(value)); }
            catch (Exception ignored) { ratio = 0D; }
        }
        ratio = Math.max(0D, Math.min(ratio, 1D));
        return Math.round(ratio * 1000000D) / 1000000D;
    }

    private int asInt(Object value, int fallback) {
        if (value instanceof Number number) return number.intValue();
        if (value != null && StringUtils.hasText(String.valueOf(value))) {
            try { return Integer.parseInt(String.valueOf(value)); }
            catch (Exception ignored) { return fallback; }
        }
        return fallback;
    }

    private double asDouble(Object value, double fallback) {
        if (value instanceof Number number) return number.doubleValue();
        if (value != null && StringUtils.hasText(String.valueOf(value))) {
            try { return Double.parseDouble(String.valueOf(value)); }
            catch (Exception ignored) { return fallback; }
        }
        return fallback;
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
            return StudentMatch.conflict(students, "姓名[" + identifierRaw + "]匹配到多名学生，请手动绑定到正确学生");
        }
        return StudentMatch.ok(students.get(0));
    }

    private Map<String, Object> buildScoreImportResultData(
            int successCount,
            int skipCount,
            int errorCount,
            int conflictCount,
            List<String> logs,
            List<Map<String, Object>> nameConflicts) {
        Map<String, Object> data = new LinkedHashMap<>();
        String summary = String.format("导入完成: 成功 %d 条, 跳过 %d 条, 错误 %d 条", successCount, skipCount, errorCount);
        if (conflictCount > 0) summary += "，重名待绑定 " + conflictCount + " 条";
        data.put("summary", summary);
        data.put("successCount", successCount);
        data.put("skipCount", skipCount);
        data.put("errorCount", errorCount);
        data.put("conflictCount", conflictCount);
        data.put("logs", logs);
        data.put("conflicts", nameConflicts);
        return data;
    }

    private Map<String, Object> buildBatchImportResultData(
            String prefix,
            int successCount,
            int skipCount,
            int errorCount,
            List<String> logs) {
        Map<String, Object> data = new LinkedHashMap<>();
        String summary = String.format("%s: 成功 %d 条, 跳过 %d 条, 错误 %d 条", prefix, successCount, skipCount, errorCount);
        data.put("summary", summary);
        data.put("successCount", successCount);
        data.put("skipCount", skipCount);
        data.put("errorCount", errorCount);
        data.put("logs", logs);
        return data;
    }

    private Map<String, Object> buildScoreImportConflict(
            int rowIndex,
            String identifierRaw,
            List<Double> questionScores,
            double totalScore,
            List<SysStudent> candidates) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("rowIndex", rowIndex);
        item.put("identifier", identifierRaw);
        item.put("studentName", identifierRaw);
        item.put("questionScores", questionScores);
        item.put("totalScore", round(totalScore));
        item.put("candidates", buildConflictCandidates(candidates));
        return item;
    }

    private List<Map<String, Object>> buildConflictCandidates(List<SysStudent> candidates) {
        return candidates.stream().map(student -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("studentNo", student.getStudentNo());
            item.put("studentName", student.getName());
            item.put("school", str(student.getSchool()));
            item.put("grade", str(student.getGrade()));
            item.put("className", str(student.getClassName()));
            return item;
        }).toList();
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

    private PaperAssetContext resolvePaperAssetContext(
            ExamSubject subject,
            String type,
            String storedPaperUrl,
            boolean persistIfMissing) throws Exception {
        String previewUrl = normalizeStoredPaperPreviewUrl(storedPaperUrl);
        if (!StringUtils.hasText(previewUrl)) {
            throw new IllegalArgumentException("当前试卷未上传，无法执行 AI识别");
        }

        Path previewPath = resolvePaperPath(previewUrl);
        if (previewPath == null || !Files.exists(previewPath)) {
            throw new IllegalArgumentException("试卷文件不存在，请重新上传后再试");
        }

        Map<String, Object> mergeInfo = resolveStoredPaperMergeInfo(subject, type);
        boolean mergeInfoChanged = false;
        if (!hasValidPaperMergeInfo(mergeInfo)) {
            mergeInfo = derivePaperMergeInfo(storedPaperUrl, previewPath);
            if (persistIfMissing && hasValidPaperMergeInfo(mergeInfo)) {
                savePaperMergeInfo(subject, type, mergeInfo);
                mergeInfoChanged = true;
            }
        }

        return new PaperAssetContext(previewUrl, previewPath, mergeInfo, mergeInfoChanged);
    }

    private PaperAssetContext resolveOptionalPaperAssetContext(
            ExamSubject subject,
            String type,
            String storedPaperUrl,
            boolean persistIfMissing) throws Exception {
        if (!StringUtils.hasText(storedPaperUrl)) return null;
        try {
            return resolvePaperAssetContext(subject, type, storedPaperUrl, persistIfMissing);
        } catch (IllegalArgumentException ex) {
            if (isMissingPaperAssetMessage(ex.getMessage())) return null;
            throw ex;
        }
    }

    private Map<String, Object> resolveStoredPaperMergeInfo(ExamSubject subject, String type) {
        if (subject == null || !StringUtils.hasText(type)) return Collections.emptyMap();
        String mergeInfoJson = "template".equals(type) ? subject.getAnswerMergeInfo() : subject.getPaperMergeInfo();
        if (StringUtils.hasText(mergeInfoJson)) {
            return map(mergeInfoJson);
        }
        return Collections.emptyMap();
    }

    private boolean hasValidPaperMergeInfo(Map<String, Object> mergeInfo) {
        if (mergeInfo == null || mergeInfo.isEmpty()) return false;
        int imageWidth = asInt(mergeInfo.get("imageWidth"), 0);
        int imageHeight = asInt(mergeInfo.get("imageHeight"), 0);
        List<Map<String, Object>> pages = mapList(mergeInfo.get("pages"));
        return imageWidth > 0 && imageHeight > 0 && !pages.isEmpty();
    }

    private boolean isMissingPaperAssetMessage(String message) {
        if (!StringUtils.hasText(message)) return false;
        return message.contains("当前试卷未上传") || message.contains("试卷文件不存在");
    }

    private void savePaperMergeInfo(ExamSubject subject, String type, Map<String, Object> mergeInfo) {
        if (subject == null || !StringUtils.hasText(type)) return;
        String mergeInfoJson = jsonMap(mergeInfo);
        if ("template".equals(type)) {
            subject.setAnswerMergeInfo(mergeInfoJson);
        } else if ("original".equals(type)) {
            subject.setPaperMergeInfo(mergeInfoJson);
        }
    }

    private void mergePagedLayoutResult(
            ExamSubject subject,
            String type,
            Integer pageIndex,
            Map<String, Object> mergeInfo,
            Map<String, Object> pageInfo,
            List<Map<String, Object>> pageRegions) {
        if (subject == null || !StringUtils.hasText(type)) return;
        if (pageRegions == null || pageRegions.isEmpty()) return;

        List<Map<String, Object>> existingRegions = new ArrayList<>(mapList("template".equals(type) ? subject.getAnswersLayouts() : subject.getPaperLayouts()));
        List<Map<String, Object>> mergedRegions = new ArrayList<>();

        if (pageIndex != null && pageIndex <= 1) existingRegions.clear();

        for (Map<String, Object> region : existingRegions) {
            if (!isRegionInPage(region, pageInfo)) mergedRegions.add(new LinkedHashMap<>(region));
        }
        for (Map<String, Object> region : pageRegions) mergedRegions.add(new LinkedHashMap<>(region));

        mergedRegions.sort(Comparator
                .comparingDouble((Map<String, Object> item) -> asDouble(item.get("y"), 0D))
                .thenComparingDouble(item -> asDouble(item.get("x"), 0D)));
        if ("template".equals(type)) {
            subject.setAnswersLayouts(jsonValue(normalizeOcrRegions(mergedRegions)));
        } else {
            subject.setPaperLayouts(jsonValue(normalizeOcrRegions(mergedRegions)));
        }
        if (hasValidPaperMergeInfo(mergeInfo)) savePaperMergeInfo(subject, type, mergeInfo);
    }

    private void mergeStudentPagedLayoutResult(
            ExamStudentScore studentScore,
            Integer pageIndex,
            Map<String, Object> mergeInfo,
            Map<String, Object> pageInfo,
            List<Map<String, Object>> pageRegions) {
        if (studentScore == null) return;
        if (pageRegions == null || pageRegions.isEmpty()) return;

        List<Map<String, Object>> existingRegions = new ArrayList<>(mapList(studentScore.getAnswerSheetLayouts()));
        List<Map<String, Object>> mergedRegions = new ArrayList<>();

        if (pageIndex != null && pageIndex <= 1) existingRegions.clear();

        for (Map<String, Object> region : existingRegions) {
            if (!isRegionInPage(region, pageInfo)) mergedRegions.add(new LinkedHashMap<>(region));
        }
        for (Map<String, Object> region : pageRegions) mergedRegions.add(new LinkedHashMap<>(region));

        mergedRegions.sort(Comparator
                .comparingDouble((Map<String, Object> item) -> asDouble(item.get("y"), 0D))
                .thenComparingDouble(item -> asDouble(item.get("x"), 0D)));

        studentScore.setAnswerSheetLayouts(jsonValue(normalizeOcrRegions(mergedRegions)));
        if (hasValidPaperMergeInfo(mergeInfo)) {
            studentScore.setAnswerMergeInfo(jsonMap(mergeInfo));
        }
    }

    private boolean isRegionInPage(Map<String, Object> region, Map<String, Object> pageInfo) {
        if (region == null || region.isEmpty() || pageInfo == null || pageInfo.isEmpty()) return false;
        
        // 使用 asDouble 安全转换，防止类型转换异常
        double pageX = asDouble(pageInfo.get("xRatio"), 0D);
        double pageY = asDouble(pageInfo.get("yRatio"), 0D);
        double pageWidth = asDouble(pageInfo.get("widthRatio"), 1D);
        double pageHeight = asDouble(pageInfo.get("heightRatio"), 1D);
        
        double regionX = asDouble(region.get("x"), 0D);
        double regionY = asDouble(region.get("y"), 0D);
        double regionW = asDouble(region.get("width"), 0D);
        double regionH = asDouble(region.get("height"), 0D);
        
        double centerX = regionX + regionW / 2D;
        double centerY = regionY + regionH / 2D;
        
        return centerX >= pageX && centerX <= (pageX + pageWidth) 
               && centerY >= pageY && centerY <= (pageY + pageHeight);
    }

    private OcrExecutionResult runPaperOcrByPages(
            Path paperPath,
            String previewUrl,
            Map<String, Object> mergeInfo,
            String subjectName,
            String imageType,
            String cutType) throws Exception {
        List<Map<String, Object>> pages = mapList(mergeInfo.get("pages"));
        int pageCount = pages.isEmpty() ? 1 : pages.size();
        String sourceType = asString(mergeInfo.get("sourceType"));
        boolean isPdfSource = "pdf".equalsIgnoreCase(sourceType);

        // 如果是多页试卷（特别是 PDF），强制执行切片扫描并识别整合
        if (pageCount <= 1 && !isPdfSource) {
            log.info("--- 单页试卷识别 (Source: {}) ---", sourceType);
            AliyunPaperOcrService.SegmentResult ocrResult = aliyunPaperOcrService.segmentPaper(paperPath, subjectName, imageType, cutType);
            List<Map<String, Object>> regions = normalizeOcrRegions(regionList(ocrResult.getRegions()));
            Map<String, Object> pageResult = new LinkedHashMap<>();
            pageResult.put("pageIndex", 1);
            pageResult.put("pageCount", 1);
            pageResult.put("paperUrl", previewUrl);
            pageResult.put("requestId", ocrResult.getRequestId());
            pageResult.put("ocrSubject", ocrResult.getOcrSubject());
            pageResult.put("imageType", ocrResult.getImageType());
            pageResult.put("cutType", ocrResult.getCutType());
            pageResult.put("recognizedCount", regions.size());
            pageResult.put("regions", regions);
            return new OcrExecutionResult(ocrResult.getRequestId(), ocrResult.getOcrSubject(), ocrResult.getImageType(), ocrResult.getCutType(), 1, regions, List.of(pageResult));
        }

        log.info("--- PDF/多页试卷切片扫描识别整合 (Source: {}, Pages: {}) ---", sourceType, pageCount);
        List<Map<String, Object>> pageResults = new ArrayList<>();
        List<Map<String, Object>> mergedRegions = new ArrayList<>();
        String requestId = "";
        String ocrSubject = "";
        String resolvedImageType = "";
        String resolvedCutType = cutType;
        for (int pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
            log.info("正在识别第 {}/{} 页...", pageIndex, pageCount);
            Map<String, Object> pageResult = runSinglePaperOcrPage(paperPath, previewUrl, mergeInfo, pageIndex, subjectName, imageType, cutType);
            pageResults.add(pageResult);
            mergedRegions.addAll(mapList(pageResult.get("regions")));
            if (!StringUtils.hasText(requestId)) requestId = asString(pageResult.get("requestId"));
            if (!StringUtils.hasText(ocrSubject)) ocrSubject = asString(pageResult.get("ocrSubject"));
            if (!StringUtils.hasText(resolvedImageType)) resolvedImageType = asString(pageResult.get("imageType"));
            if (!StringUtils.hasText(resolvedCutType)) resolvedCutType = asString(pageResult.get("cutType"));
        }
        
        List<Map<String, Object>> normalizedMerged = normalizeOcrRegions(mergedRegions);
        log.info("切片扫描识别整合完成，共识别题目数量: {}", normalizedMerged.size());
        
        return new OcrExecutionResult(requestId, ocrSubject, resolvedImageType, resolvedCutType, pageCount, normalizedMerged, pageResults);
    }

    private Map<String, Object> runSinglePaperOcrPage(
            Path paperPath,
            String previewUrl,
            Map<String, Object> mergeInfo,
            int pageIndex,
            String subjectName,
            String imageType,
            String cutType) throws Exception {
        List<Map<String, Object>> pages = mapList(mergeInfo.get("pages"));
        int pageCount = pages.isEmpty() ? 1 : pages.size();
        String sourceType = asString(mergeInfo.get("sourceType"));
        boolean isPdfSource = "pdf".equalsIgnoreCase(sourceType);

        if (pageIndex > pageCount) throw new IllegalArgumentException("页码超出范围，当前共有 " + pageCount + " 页");
        
        // 如果是普通图片单页，直接识别
        if (pageCount <= 1 && !isPdfSource) {
            AliyunPaperOcrService.SegmentResult ocrResult = aliyunPaperOcrService.segmentPaper(paperPath, subjectName, imageType, cutType);
            List<Map<String, Object>> regions = normalizeOcrRegions(regionList(ocrResult.getRegions()));
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("pageIndex", 1);
            result.put("pageCount", 1);
            result.put("paperUrl", previewUrl);
            result.put("requestId", ocrResult.getRequestId());
            result.put("ocrSubject", ocrResult.getOcrSubject());
            result.put("imageType", ocrResult.getImageType());
            result.put("cutType", ocrResult.getCutType());
            result.put("recognizedCount", regions.size());
            result.put("regions", regions);
            return result;
        }

        // PDF 每一页都必须经过切割后再识别，以保证坐标映射准确
        Map<String, Object> pageInfo = pages.get(pageIndex - 1);
        Path tempPath = null;
        try {
            tempPath = cropPageToTempImage(paperPath, pageInfo);
            AliyunPaperOcrService.SegmentResult ocrResult = aliyunPaperOcrService.segmentPaper(tempPath, subjectName, imageType, cutType);
            List<Map<String, Object>> regions = normalizeOcrRegions(mapPageRegionsToCombined(regionList(ocrResult.getRegions()), mergeInfo, pageInfo));
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("pageIndex", pageIndex);
            result.put("pageCount", pageCount);
            result.put("paperUrl", previewUrl);
            result.put("requestId", ocrResult.getRequestId());
            result.put("ocrSubject", ocrResult.getOcrSubject());
            result.put("imageType", ocrResult.getImageType());
            result.put("cutType", ocrResult.getCutType());
            result.put("recognizedCount", regions.size());
            result.put("pageInfo", pageInfo);
            result.put("regions", regions);
            return result;
        } finally {
            deleteTempFile(tempPath);
        }
    }

    private List<Map<String, Object>> mapPageRegionsToCombined(
            List<Map<String, Object>> pageRegions,
            Map<String, Object> mergeInfo,
            Map<String, Object> pageInfo) {
        double imageWidth = Math.max(asDouble(mergeInfo.get("imageWidth"), 0D), 1D);
        double imageHeight = Math.max(asDouble(mergeInfo.get("imageHeight"), 0D), 1D);
        double offsetX = Math.max(asDouble(pageInfo.get("offsetX"), 0D), 0D);
        double offsetY = Math.max(asDouble(pageInfo.get("offsetY"), 0D), 0D);
        double pageWidth = Math.max(asDouble(pageInfo.get("width"), 0D), 1D);
        double pageHeight = Math.max(asDouble(pageInfo.get("height"), 0D), 1D);

        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Map<String, Object> item : pageRegions) {
            Map<String, Object> row = new LinkedHashMap<>(item);
            double x = clampRatio(item.get("x"));
            double y = clampRatio(item.get("y"));
            double width = clampRatio(item.get("width"));
            double height = clampRatio(item.get("height"));
            row.put("x", clampRatio((offsetX + x * pageWidth) / imageWidth));
            row.put("y", clampRatio((offsetY + y * pageHeight) / imageHeight));
            row.put("width", clampRatio((width * pageWidth) / imageWidth));
            row.put("height", clampRatio((height * pageHeight) / imageHeight));
            mapped.add(row);
        }
        return mapped;
    }

    private Path cropPageToTempImage(Path paperPath, Map<String, Object> pageInfo) throws Exception {
        BufferedImage image = readImage(paperPath);
        int x = Math.max(asInt(pageInfo.get("offsetX"), 0), 0);
        int y = Math.max(asInt(pageInfo.get("offsetY"), 0), 0);
        int width = Math.max(asInt(pageInfo.get("width"), image.getWidth()), 1);
        int height = Math.max(asInt(pageInfo.get("height"), image.getHeight()), 1);
        if (x >= image.getWidth() || y >= image.getHeight()) throw new IllegalArgumentException("分页坐标超出试卷范围");
        width = Math.min(width, image.getWidth() - x);
        height = Math.min(height, image.getHeight() - y);
        BufferedImage cropped = image.getSubimage(x, y, width, height);
        return writeBufferedImageToTemp(cropped, "paper-page");
    }

    @Override
    public Result<String> startAutoCutTask(PaperOcrAutoCutDTO dto) {
        String taskId = UUID.randomUUID().toString();
        ocrTasks.put(taskId, new OcrTaskStatus(taskId, "PENDING", 0, "任务已提交", null, System.currentTimeMillis()));
        
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                ocrTasks.put(taskId, new OcrTaskStatus(taskId, "RUNNING", 10, "正在识别试卷布局...", null, System.currentTimeMillis()));
                Result<Map<String, Object>> result = autoCutPaperLayoutByOcr(dto, taskId);
                if (result.getCode() == 200) {
                    ocrTasks.put(taskId, new OcrTaskStatus(taskId, "COMPLETED", 100, "识别完成", result.getData(), System.currentTimeMillis()));
                } else {
                    ocrTasks.put(taskId, new OcrTaskStatus(taskId, "FAILED", 0, result.getMsg(), null, System.currentTimeMillis()));
                }
            } catch (Exception e) {
                log.error("OCR 任务执行异常: {}", e.getMessage(), e);
                ocrTasks.put(taskId, new OcrTaskStatus(taskId, "FAILED", 0, "系统内部错误: " + e.getMessage(), null, System.currentTimeMillis()));
            }
        });
        
        return Result.success("任务已启动", taskId);
    }

    @Override
    public Result<Map<String, Object>> getOcrTaskStatus(String taskId) {
        OcrTaskStatus status = ocrTasks.get(taskId);
        if (status == null) {
            return Result.error("未找到对应任务");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", status.taskId());
        data.put("status", status.status());
        data.put("progress", status.progress());
        data.put("message", status.message());
        data.put("result", status.result());
        return Result.success(data);
    }
}
