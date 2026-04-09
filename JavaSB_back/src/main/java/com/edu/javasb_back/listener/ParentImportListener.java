package com.edu.javasb_back.listener;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.model.dto.ParentImportDTO;

public class ParentImportListener extends AnalysisEventListener<ParentImportDTO> {
    private final List<ParentImportDTO> list = new ArrayList<>();
    private static final String[] EXPECTED_HEADERS = {"用户名", "昵称", "手机号", "密码", "VIP", "SVIP", "学生学号"};

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
    public void invoke(ParentImportDTO data, AnalysisContext context) {
        if (isEmpty(data.getUsername()) || isEmpty(data.getNickname()) || isEmpty(data.getPhone())) {
            throw new ExcelAnalysisException("含有空数据：用户名、昵称、手机号为必填项");
        }
        list.add(data);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
    }

    public List<ParentImportDTO> getList() {
        return list;
    }
}
