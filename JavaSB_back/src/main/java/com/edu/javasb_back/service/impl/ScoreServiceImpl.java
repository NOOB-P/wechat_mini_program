package com.edu.javasb_back.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.Exam;
import com.edu.javasb_back.model.entity.ExamResult;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.ExamRepository;
import com.edu.javasb_back.repository.ExamResultRepository;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.ScoreService;

@Service
public class ScoreServiceImpl implements ScoreService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysStudentRepository studentRepository;

    private String getStudentNoByUid(Long uid) {
        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(uid);
        if (bindings.isEmpty()) return null;
        
        Optional<SysStudent> studentOpt = studentRepository.findById(bindings.get(0).getStudentId());
        return studentOpt.map(SysStudent::getStudentNo).orElse(null);
    }

    @Override
    public Result<Map<String, Object>> getSemesterList(Long uid) {
        String studentNo = getStudentNoByUid(uid);
        if (studentNo == null) {
            return Result.error("未绑定学生账号");
        }

        List<Exam> exams = examRepository.findExamsByStudentNo(studentNo);
        
        // 按照学期分组。这里简单处理，根据考试名称或日期提取学期。
        // 假设名称包含学年信息，如 "2023-2024学年第一学期..."
        Map<String, List<Map<String, Object>>> semesterData = new HashMap<>();
        List<Map<String, Object>> semesters = new ArrayList<>();
        Set<String> processedSemesters = new HashSet<>();

        for (Exam exam : exams) {
            String name = exam.getName();
            String semesterKey = "未知学期";
            if (name.contains("第一学期")) {
                semesterKey = name.substring(0, name.indexOf("学期") + 2);
            } else if (name.contains("第二学期")) {
                semesterKey = name.substring(0, name.indexOf("学期") + 2);
            } else {
                // 如果名称没写学期，按年份分
                semesterKey = exam.getExamDate().getYear() + "学年";
            }

            if (!processedSemesters.contains(semesterKey)) {
                Map<String, Object> semesterMap = new HashMap<>();
                semesterMap.put("label", semesterKey);
                semesterMap.put("value", semesterKey);
                semesters.add(semesterMap);
                processedSemesters.add(semesterKey);
            }

            List<Map<String, Object>> examList = semesterData.computeIfAbsent(semesterKey, k -> new ArrayList<>());
            Map<String, Object> examMap = new HashMap<>();
            examMap.put("label", exam.getName());
            examMap.put("value", exam.getId());
            examList.add(examMap);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("semesters", semesters);
        resultMap.put("semesterData", semesterData);
        return Result.success(resultMap);
    }

    @Override
    public Result<Map<String, Object>> getStudentScores(Long uid, String semester, String examId) {
        String studentNo = getStudentNoByUid(uid);
        if (studentNo == null) return Result.error("未绑定学生账号");

        Optional<ExamResult> resultOpt = examResultRepository.findByStudentNoAndExamId(studentNo, examId);
        if (resultOpt.isEmpty()) return Result.error("暂无该场考试成绩");

        ExamResult er = resultOpt.get();
        Optional<Exam> examOpt = examRepository.findById(examId);
        Exam exam = examOpt.orElse(null);

        // 构造返回数据，匹配前端 index.vue 的需求
        Map<String, Object> data = new HashMap<>();
        data.put("examName", exam != null ? exam.getName() : "未知考试");
        data.put("examDate", exam != null ? exam.getExamDate().toString() : "");
        data.put("totalScore", er.getTotalScore());
        
        // 计算等级 (简单逻辑)
        float score = er.getTotalScore();
        String level = "B";
        if (score >= 90) level = "A+";
        else if (score >= 80) level = "A";
        else if (score >= 70) level = "B+";
        data.put("totalLevel", level);

        // 模拟科目成绩 (因为数据库目前只有 total_score)
        // 实际开发中应该从 exam_results 或其关联表获取
        List<Map<String, Object>> subjects = new ArrayList<>();
        Map<String, Object> chinese = new HashMap<>();
        chinese.put("name", "语文");
        chinese.put("score", Math.round(score * 0.8));
        chinese.put("fullScore", 150);
        chinese.put("level", "A");
        subjects.add(chinese);

        Map<String, Object> math = new HashMap<>();
        math.put("name", "数学");
        math.put("score", Math.round(score * 0.9));
        math.put("fullScore", 150);
        math.put("level", "A+");
        subjects.add(math);

        Map<String, Object> english = new HashMap<>();
        english.put("name", "英语");
        english.put("score", Math.round(score * 0.7));
        english.put("fullScore", 150);
        english.put("level", "B");
        subjects.add(english);
        data.put("subjects", subjects);

        // 模拟历史趋势
        List<ExamResult> historyResults = examResultRepository.findTop6ByStudentNoOrderByCreateTimeDesc(studentNo);
        List<Map<String, Object>> history = historyResults.stream().map(h -> {
            Optional<Exam> e = examRepository.findById(h.getExamId());
            Map<String, Object> hMap = new HashMap<>();
            hMap.put("period", e.isPresent() ? e.get().getName() : "历史考试");
            hMap.put("score", h.getTotalScore());
            return hMap;
        }).collect(Collectors.toList());
        data.put("history", history);

        return Result.success(data);
    }
}
