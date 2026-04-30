package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.dto.ExamPaperImportBatchInitDTO;
import com.edu.javasb_back.model.dto.ExamPaperImportManifestDTO;
import com.edu.javasb_back.model.dto.ExamProjectSaveDTO;
import com.edu.javasb_back.model.dto.PaperLayoutSaveDTO;
import com.edu.javasb_back.model.dto.PaperOcrAutoCutDTO;
import com.edu.javasb_back.model.dto.PaperRegionOcrDTO;
import com.edu.javasb_back.service.ExamProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/system/exam-project")
public class ExamProjectController {

    @Autowired
    private ExamProjectService examProjectService;

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰鍒楄〃")
    @PreAuthorize("hasAuthority('exam:project:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getProjectList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name) {
        return examProjectService.getProjectList(current, size, name);
    }

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰鍒涘缓閰嶇疆")
    @PreAuthorize("hasAuthority('exam:project:options')")
    @GetMapping("/options")
    public Result<Map<String, Object>> getProjectOptions() {
        return examProjectService.getProjectOptions();
    }

    @LogOperation("鏂板鑰冭瘯椤圭洰")
    @PreAuthorize("hasAuthority('exam:project:add')")
    @PostMapping("/add")
    public Result<Void> addProject(@RequestBody ExamProjectSaveDTO project) {
        return examProjectService.addProject(project);
    }

    @LogOperation("鏇存柊鑰冭瘯椤圭洰")
    @PreAuthorize("hasAuthority('exam:project:edit')")
    @PutMapping("/edit")
    public Result<Void> updateProject(@RequestBody ExamProjectSaveDTO project) {
        return examProjectService.updateProject(project);
    }

    @LogOperation("鍒犻櫎鑰冭瘯椤圭洰")
    @PreAuthorize("hasAuthority('exam:project:delete')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteProject(@PathVariable String id) {
        return examProjectService.deleteProject(id);
    }

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰璇︽儏")
    @PreAuthorize("hasAuthority('exam:project:detail')")
    @GetMapping("/detail/{id}")
    public Result<Map<String, Object>> getProjectDetail(@PathVariable String id) {
        return examProjectService.getProjectDetail(id);
    }

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰鑰冪敓鍒楄〃")
    @PreAuthorize("hasAuthority('exam:project:students')")
    @GetMapping("/students")
    public Result<Map<String, Object>> getProjectStudents(
            @RequestParam String projectId,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return examProjectService.getProjectStudentPage(projectId, current, size, keyword, schoolId, classId);
    }

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰鎴愮哗姒傝")
    @PreAuthorize("hasAuthority('exam:project:score-summary')")
    @GetMapping("/scores/summary")
    public Result<Map<String, Object>> getProjectScoreSummary(@RequestParam String projectId) {
        return examProjectService.getProjectScoreSummary(projectId);
    }

    @LogOperation("鑾峰彇鑰冭瘯椤圭洰鎴愮哗鍒楄〃")
    @PreAuthorize("hasAuthority('exam:project:score-list')")
    @GetMapping("/scores/list")
    public Result<Map<String, Object>> getProjectScoreList(
            @RequestParam String projectId,
            @RequestParam(required = false) String subjectName,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return examProjectService.getProjectScorePage(
                projectId,
                subjectName,
                current,
                size,
                keyword,
                schoolId,
                classId
        );
    }

    @LogOperation("涓嬭浇鎴愮哗瀵煎叆妯℃澘")
    @PreAuthorize("hasAuthority('exam:project:score-template')")
    @GetMapping("/scores/template")
    public ResponseEntity<Resource> downloadScoreTemplate() {
        return examProjectService.downloadScoreTemplate();
    }

    @LogOperation("瀵煎叆鎴愮哗")
    @PreAuthorize("hasAuthority('exam:project:score-import')")
    @PostMapping("/scores/import")
    public Result<Map<String, Object>> importScores(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam MultipartFile file) {
        return examProjectService.importScores(projectId, subjectName, file);
    }

    @LogOperation("瀵煎嚭鎴愮哗")
    @PreAuthorize("hasAuthority('exam:project:score-export')")
    @GetMapping("/scores/export")
    public ResponseEntity<Resource> exportScores(
            @RequestParam String projectId,
            @RequestParam(required = false) String subjectName) {
        return examProjectService.exportScores(projectId, subjectName);
    }

    @LogOperation("初始化试卷批量导入直传批次")
    @PreAuthorize("hasAuthority('exam:project:paper-import')")
    @PostMapping("/papers/import/init")
    public Result<Map<String, Object>> initAnswerSheetImportBatch(@RequestBody ExamPaperImportBatchInitDTO dto) {
        return examProjectService.initAnswerSheetImportBatch(dto);
    }

    @LogOperation("提交试卷批量导入清单")
    @PreAuthorize("hasAuthority('exam:project:paper-import')")
    @PostMapping("/papers/import/manifest")
    public Result<Map<String, Object>> importAnswerSheetsByManifest(@RequestBody ExamPaperImportManifestDTO dto) {
        return examProjectService.importAnswerSheetsByManifest(dto);
    }

    @LogOperation("鎵归噺瀵煎叆璇曞嵎")
    @PreAuthorize("hasAuthority('exam:project:paper-import')")
    @PostMapping("/papers/import")
    public Result<Map<String, Object>> importAnswerSheets(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam MultipartFile file) {
        return examProjectService.importAnswerSheets(projectId, subjectName, file);
    }

    @LogOperation("涓婁紶鍗曚釜璇曞嵎")
    @PreAuthorize("hasAuthority('exam:project:paper-upload')")
    @PostMapping("/papers/upload")
    public Result<String> uploadAnswerSheet(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam String studentNo,
            @RequestParam MultipartFile file) {
        return examProjectService.uploadAnswerSheet(projectId, subjectName, studentNo, file);
    }

    @LogOperation("涓婁紶鍏叡璇曞嵎(鏍锋澘/鍘熷嵎)")
    @PostMapping("/papers/upload-public")
    public Result<String> uploadPublicPaper(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam String type,
            @RequestParam MultipartFile file) {
        return examProjectService.uploadPublicPaper(projectId, subjectName, type, file);
    }

    @LogOperation("鑾峰彇璇曞嵎閰嶇疆")
    @GetMapping("/papers/config")
    public Result<Map<String, Object>> getPaperConfig(
            @RequestParam String projectId,
            @RequestParam String subjectName) {
        return examProjectService.getPaperConfig(projectId, subjectName);
    }

    @LogOperation("淇濆瓨璇曞嵎妗嗛€夊竷灞€")
    @PostMapping("/papers/layout/save")
    public Result<Void> savePaperLayout(@RequestBody PaperLayoutSaveDTO dto) {
        return examProjectService.savePaperLayout(dto);
    }

    @LogOperation("OCR 鑷姩鍒囧壊璇曞嵎 (寮傛)")
    @PostMapping("/papers/layout/ocr-auto/start")
    public Result<String> startAutoCutTask(@RequestBody PaperOcrAutoCutDTO dto) {
        return examProjectService.startAutoCutTask(dto);
    }

    @LogOperation("鑾峰彇 OCR 浠诲姟鐘舵€?")
    @GetMapping("/papers/layout/ocr-auto/status/{taskId}")
    public Result<Map<String, Object>> getOcrTaskStatus(@PathVariable String taskId) {
        return examProjectService.getOcrTaskStatus(taskId);
    }

    @LogOperation("OCR 鑷姩鍒囧壊璇曞嵎")
    @PostMapping("/papers/layout/ocr-auto")
    public Result<Map<String, Object>> autoCutPaperLayoutByOcr(@RequestBody PaperOcrAutoCutDTO dto) {
        return examProjectService.autoCutPaperLayoutByOcr(dto);
    }

    @LogOperation("OCR 璇嗗埆璇曞嵎鍒嗛〉")
    @PostMapping("/papers/layout/ocr-page")
    public Result<Map<String, Object>> ocrPaperLayoutPage(@RequestBody PaperOcrAutoCutDTO dto) {
        return examProjectService.ocrPaperLayoutPage(dto);
    }

    @LogOperation("OCR 璇嗗埆鍗曚釜棰樻鏂囨湰")
    @PostMapping("/papers/layout/ocr-question")
    public Result<Map<String, Object>> ocrPaperRegion(@RequestBody PaperRegionOcrDTO dto) {
        return examProjectService.ocrPaperRegion(dto);
    }

    @LogOperation("AI 鍒嗘瀽鍗曚釜棰樼洰")
    @PostMapping("/papers/layout/analyze-question")
    public Result<Map<String, Object>> analyzePaperRegion(@RequestBody PaperRegionOcrDTO dto) {
        return examProjectService.analyzePaperRegion(dto);
    }

    @LogOperation("淇濆瓨鍗曚釜瀛︾敓鎴愮哗")
    @PreAuthorize("hasAuthority('exam:project:score-save')")
    @PostMapping("/scores/save")
    public Result<Void> saveStudentScore(
            @RequestParam String projectId,
            @RequestParam String subjectName,
            @RequestParam String studentNo,
            @RequestBody java.util.List<Double> questionScores) {
        return examProjectService.saveStudentScore(projectId, subjectName, studentNo, questionScores);
    }
}
