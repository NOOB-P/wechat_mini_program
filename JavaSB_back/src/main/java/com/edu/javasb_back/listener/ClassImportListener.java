package com.edu.javasb_back.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.model.dto.ClassImportDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ClassImportListener extends AnalysisEventListener<ClassImportDTO> {
    private List<ClassImportDTO> list = new ArrayList<>();
    private static final String[] EXPECTED_HEADERS = {"省份", "城市", "学校", "年级", "班级"};

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
    public void invoke(ClassImportDTO data, AnalysisContext context) {
        // 去除前后空白字符
        if (data.getProvince() != null) data.setProvince(data.getProvince().trim());
        if (data.getCity() != null) data.setCity(data.getCity().trim());
        if (data.getSchoolName() != null) data.setSchoolName(data.getSchoolName().trim());
        if (data.getGrade() != null) data.setGrade(data.getGrade().trim());
        if (data.getAlias() != null) data.setAlias(data.getAlias().trim());

        // 校验空数据
        if (isEmpty(data.getProvince()) || isEmpty(data.getCity()) || isEmpty(data.getSchoolName()) || isEmpty(data.getGrade()) || isEmpty(data.getAlias())) {
            throw new ExcelAnalysisException("含有空数据");
        }
        list.add(data);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 解析结束
    }

    public List<ClassImportDTO> getList() {
        return list;
    }
}
