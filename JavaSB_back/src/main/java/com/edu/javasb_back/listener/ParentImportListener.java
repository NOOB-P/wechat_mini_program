package com.edu.javasb_back.listener;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.model.dto.ParentImportDTO;

public class ParentImportListener extends AnalysisEventListener<ParentImportDTO> {
    private final List<ParentImportDTO> list = new ArrayList<>();
    private static final String[] EXPECTED_HEADERS = {"省", "市", "校", "班级", "学生姓名", "手机号", "会员类型"};

    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        List<String> headers = headMap.entrySet().stream()
                .sorted(Comparator.comparingInt(Map.Entry::getKey))
                .map(Map.Entry::getValue)
                .map(this::normalizeHeader)
                .filter(header -> header != null && !header.isEmpty())
                .toList();

        if (headers.size() != EXPECTED_HEADERS.length) {
            throw new ExcelAnalysisException("检查格式：列数量不正确，应为 " + EXPECTED_HEADERS.length + " 列");
        }
        for (int i = 0; i < EXPECTED_HEADERS.length; i++) {
            String header = headers.get(i);
            if (!EXPECTED_HEADERS[i].equals(header)) {
                throw new ExcelAnalysisException("检查格式：第 " + (i + 1) + " 列标题应为 [" + EXPECTED_HEADERS[i] + "]");
            }
        }
    }

    @Override
    public void invoke(ParentImportDTO data, AnalysisContext context) {
        // 如果是说明行，跳过
        if (data.getProvince() != null && data.getProvince().contains("说明：")) {
            return;
        }
        
        // 不再直接抛出异常，让 Controller 处理空数据并记录到跳过明细中
        list.add(data);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private String normalizeHeader(String header) {
        if (header == null) {
            return null;
        }
        return header.replace("\uFEFF", "").trim();
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
    }

    public List<ParentImportDTO> getList() {
        return list;
    }
}
