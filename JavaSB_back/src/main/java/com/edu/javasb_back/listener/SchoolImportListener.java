package com.edu.javasb_back.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.model.dto.SchoolImportDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SchoolImportListener extends AnalysisEventListener<SchoolImportDTO> {
    private List<SchoolImportDTO> list = new ArrayList<>();
    private static final String[] EXPECTED_HEADERS = {"省份", "城市", "学校"};

    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        if (headMap.size() < 3) {
            throw new ExcelAnalysisException("检查格式：列数量不正确，应至少为 3 列");
        }
        for (int i = 0; i < 3; i++) {
            String header = headMap.get(i);
            // 匹配时去掉所有空白字符（包括空格、回车、换行、制表符等）
            if (header == null || !header.replaceAll("\\s+", "").contains(EXPECTED_HEADERS[i])) {
                throw new ExcelAnalysisException("检查格式：第 " + (i + 1) + " 列标题应包含 [" + EXPECTED_HEADERS[i] + "]");
            }
        }
    }

    @Override
    public void invoke(SchoolImportDTO data, AnalysisContext context) {
        // 去除前后空白字符
        if (data.getProvince() != null) data.setProvince(data.getProvince().trim());
        if (data.getCity() != null) data.setCity(data.getCity().trim());
        if (data.getSchoolName() != null) data.setSchoolName(data.getSchoolName().trim());

        // 校验空数据
        if (isEmpty(data.getProvince()) || isEmpty(data.getCity()) || isEmpty(data.getSchoolName())) {
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

    public List<SchoolImportDTO> getList() {
        return list;
    }
}