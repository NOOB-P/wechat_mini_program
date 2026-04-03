package com.edu.javasb_back.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.model.dto.StudentImportDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class StudentImportListener extends AnalysisEventListener<StudentImportDTO> {
    private List<StudentImportDTO> list = new ArrayList<>();
    private static final String[] EXPECTED_HEADERS = {"学号", "姓名", "性别", "省份", "城市", "学校", "年级", "班级"};

    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        if (headMap.size() != EXPECTED_HEADERS.length) {
            throw new ExcelAnalysisException("检查格式：列数量不正确，应为 " + EXPECTED_HEADERS.length + " 列");
        }
        for (int i = 0; i < EXPECTED_HEADERS.length; i++) {
            String header = headMap.get(i);
            if (header == null || !EXPECTED_HEADERS[i].equals(header.trim())) {
                throw new ExcelAnalysisException("检查格式：第 " + (i + 1) + " 列标题应为 [" + EXPECTED_HEADERS[i] + "]");
            }
        }
    }

    @Override
    public void invoke(StudentImportDTO data, AnalysisContext context) {
        // 校验空数据
        if (isEmpty(data.getStudentNo()) || isEmpty(data.getName()) || isEmpty(data.getGender()) || 
            isEmpty(data.getProvince()) || isEmpty(data.getCity()) || isEmpty(data.getSchool()) || 
            isEmpty(data.getGrade()) || isEmpty(data.getClassName())) {
            throw new ExcelAnalysisException("含有空数据");
        }
        list.add(data);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 结束
    }

    public List<StudentImportDTO> getList() {
        return list;
    }
}
