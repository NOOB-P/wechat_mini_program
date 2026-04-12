package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.service.OrganizationImportService;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrganizationImportServiceImpl implements OrganizationImportService {

    private static final DataFormatter DATA_FORMATTER = new DataFormatter();

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> importSchoolStructure(MultipartFile file) {
        ParsedSheet parsedSheet = parseExcel(file);
        TemplateMode mode = detectMode(parsedSheet.headers(), List.of(
                TemplateMode.SCHOOL_ONLY,
                TemplateMode.SCHOOL_CLASS,
                TemplateMode.SCHOOL_CLASS_STUDENT
        ), "学校导入");
        validateRows(parsedSheet.rows(), mode);

        for (ParsedRow row : parsedSheet.rows()) {
            SysSchool school = resolveSchool(mode, row, null);
            if (mode.includesClass()) {
                SysClass sysClass = resolveClass(mode, row, school, null);
                if (mode.includesStudent()) {
                    saveOrUpdateStudent(row, school, sysClass);
                }
            }
        }

        return Result.success("上传成功，校验通过并处理完成，共处理 " + parsedSheet.rows().size() + " 条数据", null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> importClassStructure(MultipartFile file, String schoolId) {
        ParsedSheet parsedSheet = parseExcel(file);
        TemplateMode mode = detectMode(parsedSheet.headers(), List.of(
                TemplateMode.CLASS_ONLY,
                TemplateMode.CLASS_STUDENT,
                TemplateMode.SCHOOL_CLASS,
                TemplateMode.SCHOOL_CLASS_STUDENT
        ), "班级导入");

        if ((mode == TemplateMode.CLASS_ONLY || mode == TemplateMode.CLASS_STUDENT) && !StringUtils.hasText(schoolId)) {
            throw new IllegalArgumentException("当前模板不包含学校信息，请从指定学校页面进入后再导入");
        }

        validateRows(parsedSheet.rows(), mode);

        for (ParsedRow row : parsedSheet.rows()) {
            SysSchool school = resolveSchool(mode, row, schoolId);
            SysClass sysClass = resolveClass(mode, row, school, null);
            if (mode.includesStudent()) {
                saveOrUpdateStudent(row, school, sysClass);
            }
        }

        return Result.success("上传成功，校验通过并处理完成，共处理 " + parsedSheet.rows().size() + " 条数据", null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> importStudentStructure(MultipartFile file, String schoolId, String classId) {
        ParsedSheet parsedSheet = parseExcel(file);
        TemplateMode mode = detectMode(parsedSheet.headers(), List.of(
                TemplateMode.STUDENT_ONLY,
                TemplateMode.CLASS_STUDENT,
                TemplateMode.SCHOOL_CLASS_STUDENT
        ), "学生导入");

        if (mode == TemplateMode.STUDENT_ONLY) {
            if (!StringUtils.hasText(schoolId) || !StringUtils.hasText(classId)) {
                throw new IllegalArgumentException("学生模板仅包含学号和姓名，请从指定班级页面进入后再导入");
            }
        } else if (mode == TemplateMode.CLASS_STUDENT && !StringUtils.hasText(schoolId)) {
            throw new IllegalArgumentException("班级-学生模板不包含学校信息，请从指定学校页面进入后再导入");
        }

        validateRows(parsedSheet.rows(), mode);

        for (ParsedRow row : parsedSheet.rows()) {
            SysSchool school = resolveSchool(mode, row, schoolId);
            SysClass sysClass = resolveClass(mode, row, school, classId);
            saveOrUpdateStudent(row, school, sysClass);
        }

        return Result.success("上传成功，校验通过并处理完成，共处理 " + parsedSheet.rows().size() + " 条数据", null);
    }

    private ParsedSheet parseExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件内容为空");
        }

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException("Excel中没有可读取的工作表");
            }

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw new IllegalArgumentException("Excel表头不能为空");
            }

            List<String> headers = readHeaders(headerRow);
            if (headers.isEmpty()) {
                throw new IllegalArgumentException("Excel表头不能为空");
            }

            List<ParsedRow> rows = new ArrayList<>();
            for (int rowIndex = headerRow.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (isRowEmpty(row, headers.size())) {
                    continue;
                }
                Map<String, String> values = new LinkedHashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    values.put(headers.get(i), readCell(row, i));
                }
                rows.add(new ParsedRow(rowIndex + 1, values));
            }

            if (rows.isEmpty()) {
                throw new IllegalArgumentException("Excel中没有可导入的数据");
            }

            return new ParsedSheet(headers, rows);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Excel解析失败：" + e.getMessage(), e);
        }
    }

    private List<String> readHeaders(Row headerRow) {
        List<String> headers = new ArrayList<>();
        short lastCellNum = headerRow.getLastCellNum();
        for (int i = 0; i < lastCellNum; i++) {
            headers.add(normalize(readCell(headerRow, i)));
        }
        while (!headers.isEmpty() && !StringUtils.hasText(headers.get(headers.size() - 1))) {
            headers.remove(headers.size() - 1);
        }
        return headers;
    }

    private boolean isRowEmpty(Row row, int headerSize) {
        if (row == null) {
            return true;
        }
        for (int i = 0; i < headerSize; i++) {
            if (StringUtils.hasText(readCell(row, i))) {
                return false;
            }
        }
        return true;
    }

    private String readCell(Row row, int cellIndex) {
        if (row == null || row.getCell(cellIndex) == null) {
            return "";
        }
        return normalize(DATA_FORMATTER.formatCellValue(row.getCell(cellIndex)));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\uFEFF", "").trim();
    }

    private TemplateMode detectMode(List<String> headers, List<TemplateMode> candidates, String sceneName) {
        for (TemplateMode candidate : candidates) {
            if (candidate.headers.equals(headers)) {
                return candidate;
            }
        }
        throw new IllegalArgumentException(sceneName + "模板不匹配，请使用下载的标准模板，且不要修改表头顺序或文字");
    }

    private void validateRows(List<ParsedRow> rows, TemplateMode mode) {
        for (ParsedRow row : rows) {
            for (String header : mode.headers) {
                String value = row.values.get(header);
                if (!StringUtils.hasText(value)) {
                    throw new IllegalArgumentException("第 " + row.rowNumber + " 行的 [" + header + "] 不能为空");
                }
            }
        }
    }

    private SysSchool resolveSchool(TemplateMode mode, ParsedRow row, String providedSchoolId) {
        if (mode.hasSchoolColumns()) {
            String province = row.get("省份");
            String city = row.get("城市");
            String schoolName = row.get("学校");
            return findOrCreateSchool(province, city, schoolName);
        }

        return sysSchoolRepository.findBySchoolId(providedSchoolId)
                .orElseThrow(() -> new IllegalArgumentException("未找到关联学校，请确认当前页面学校信息有效"));
    }

    private SysClass resolveClass(TemplateMode mode, ParsedRow row, SysSchool school, String providedClassId) {
        if (mode.hasClassColumns()) {
            String grade = row.get("年级");
            String className = row.get("班级");
            return findOrCreateClass(school.getSchoolId(), grade, className);
        }

        SysClass sysClass = sysClassRepository.findByClassid(providedClassId)
                .orElseThrow(() -> new IllegalArgumentException("未找到关联班级，请确认当前页面班级信息有效"));
        if (!school.getSchoolId().equals(sysClass.getSchoolId())) {
            throw new IllegalArgumentException("当前班级不属于所选学校，请刷新页面后重试");
        }
        return sysClass;
    }

    private SysSchool findOrCreateSchool(String province, String city, String schoolName) {
        Optional<SysSchool> schoolOptional = sysSchoolRepository.findFirstByProvinceAndCityAndName(province, city, schoolName);
        if (schoolOptional.isPresent()) {
            return schoolOptional.get();
        }

        SysSchool school = new SysSchool();
        school.setSchoolId(generateSchoolId());
        school.setProvince(province);
        school.setCity(city);
        school.setName(schoolName);
        school.setType("school");
        school.setStatus(1);
        return sysSchoolRepository.save(school);
    }

    private SysClass findOrCreateClass(String schoolId, String grade, String alias) {
        Optional<SysClass> classOptional = sysClassRepository.findFirstBySchoolIdAndGradeAndAlias(schoolId, grade, alias);
        if (classOptional.isPresent()) {
            return classOptional.get();
        }

        SysClass sysClass = new SysClass();
        sysClass.setClassid(generateClassId());
        sysClass.setSchoolId(schoolId);
        sysClass.setGrade(grade);
        sysClass.setAlias(alias);
        return sysClassRepository.save(sysClass);
    }

    private void saveOrUpdateStudent(ParsedRow row, SysSchool school, SysClass sysClass) {
        String studentNo = row.get("学号");
        String studentName = row.get("姓名");

        Optional<SysStudent> studentOptional = sysStudentRepository.findByStudentNo(studentNo);
        SysStudent student = studentOptional.orElseGet(SysStudent::new);

        if (!studentOptional.isPresent()) {
            student.setId(UUID.randomUUID().toString());
            student.setBoundCount(0);
            student.setStudentNo(studentNo);
        }

        student.setName(studentName);
        student.setSchoolId(school.getSchoolId());
        student.setClassId(sysClass.getClassid());
        student.setSchool(school.getName());
        student.setGrade(sysClass.getGrade());
        student.setClassName(sysClass.getAlias());
        sysStudentRepository.save(student);
    }

    private String generateSchoolId() {
        String schoolId;
        do {
            schoolId = "SCH" + System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(100, 1000);
        } while (sysSchoolRepository.findBySchoolId(schoolId).isPresent());
        return schoolId;
    }

    private String generateClassId() {
        String classId;
        do {
            classId = "CLS" + System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(100, 1000);
        } while (sysClassRepository.existsByClassid(classId));
        return classId;
    }

    private enum TemplateMode {
        SCHOOL_ONLY(List.of("省份", "城市", "学校")),
        SCHOOL_CLASS(List.of("省份", "城市", "学校", "年级", "班级")),
        SCHOOL_CLASS_STUDENT(List.of("省份", "城市", "学校", "年级", "班级", "学号", "姓名")),
        CLASS_ONLY(List.of("年级", "班级")),
        CLASS_STUDENT(List.of("年级", "班级", "学号", "姓名")),
        STUDENT_ONLY(List.of("学号", "姓名"));

        private final List<String> headers;

        TemplateMode(List<String> headers) {
            this.headers = headers;
        }

        public boolean hasSchoolColumns() {
            return this == SCHOOL_ONLY || this == SCHOOL_CLASS || this == SCHOOL_CLASS_STUDENT;
        }

        public boolean hasClassColumns() {
            return this == SCHOOL_CLASS || this == SCHOOL_CLASS_STUDENT || this == CLASS_ONLY || this == CLASS_STUDENT;
        }

        public boolean includesClass() {
            return this == SCHOOL_CLASS || this == SCHOOL_CLASS_STUDENT || this == CLASS_ONLY || this == CLASS_STUDENT;
        }

        public boolean includesStudent() {
            return this == SCHOOL_CLASS_STUDENT || this == CLASS_STUDENT || this == STUDENT_ONLY;
        }
    }

    private record ParsedSheet(List<String> headers, List<ParsedRow> rows) {
    }

    private static class ParsedRow {
        private final int rowNumber;
        private final Map<String, String> values;

        private ParsedRow(int rowNumber, Map<String, String> values) {
            this.rowNumber = rowNumber;
            this.values = values;
        }

        private String get(String key) {
            return values.getOrDefault(key, "");
        }
    }
}
