package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.service.SysAccountService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/system/user")
public class SysAccountController {

    @Autowired
    private SysAccountService sysAccountService;

    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @LogOperation("查询账户列表")
    @PreAuthorize("hasAuthority('system:user:list')")
    @GetMapping("/list")
    public Result<Map<String, Object>> getAccountList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String userPhone,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String classId) {
        return sysAccountService.getAccountList(getCurrentUid(), current, size, userName, userPhone, roleId, schoolId, classId);
    }

    @LogOperation("添加账户")
    @PreAuthorize("hasAuthority('system:user:add')")
    @PostMapping("/add")
    public Result<Void> addAccount(@RequestBody SysAccount account) {
        return sysAccountService.addAccount(getCurrentUid(), account);
    }

    @LogOperation("批量导入家长用户")
    @PreAuthorize("hasAuthority('system:user:import')")
    @PostMapping("/import-parents")
    public Result<Map<String, Object>> importParents(@RequestParam("file") MultipartFile file) {
        return sysAccountService.importParents(getCurrentUid(), file);
    }

    @LogOperation("下载家长导入模板")
    @PreAuthorize("hasAuthority('system:user:template')")
    @GetMapping("/download-parent-template")
    public ResponseEntity<Resource> downloadParentTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("家长导入模板");
            String[] headers = {"用户名", "昵称", "手机号", "密码", "VIP", "SVIP", "学生学号"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
                sheet.setColumnWidth(i, 18 * 256);
            }

            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("parent_demo01");
            sampleRow.createCell(1).setCellValue("张三爸爸");
            sampleRow.createCell(2).setCellValue("13800001234");
            sampleRow.createCell(3).setCellValue("123456");
            sampleRow.createCell(4).setCellValue("是");
            sampleRow.createCell(5).setCellValue("否");
            sampleRow.createCell(6).setCellValue("STU2026001");

            Row tipsRow = sheet.createRow(2);
            tipsRow.createCell(0).setCellValue("说明：密码留空默认为手机号后六位；VIP/SVIP 填 是/否；学生学号可选");

            workbook.write(outputStream);
            String filename = URLEncoder.encode("家长导入模板.xlsx", StandardCharsets.UTF_8);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new ByteArrayResource(outputStream.toByteArray()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @LogOperation("编辑账户")
    @PreAuthorize("hasAuthority('system:user:edit')")
    @PutMapping("/edit/{uid}")
    public Result<Void> editAccount(@PathVariable Long uid, @RequestBody SysAccount updateData) {
        return sysAccountService.editAccount(getCurrentUid(), uid, updateData);
    }

    @LogOperation("批量删除账户")
    @PreAuthorize("hasAuthority('system:user:delete')")
    @PostMapping("/batch-delete")
    public Result<Void> batchDelete(@RequestBody Map<String, java.util.List<Long>> body) {
        java.util.List<Long> uids = body.get("uids");
        return sysAccountService.batchDeleteAccounts(getCurrentUid(), uids);
    }
}
