package com.edu.javasb_back.controller;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.exception.ExcelAnalysisException;
import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.listener.ParentImportListener;
import com.edu.javasb_back.model.dto.ParentImportDTO;
import com.edu.javasb_back.model.entity.StudentParentBinding;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysSchool;
import com.edu.javasb_back.model.entity.SysClass;
import com.edu.javasb_back.model.entity.SysStudent;
import com.edu.javasb_back.repository.StudentParentBindingRepository;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysStudentRepository;
import com.edu.javasb_back.repository.SysSchoolRepository;
import com.edu.javasb_back.repository.SysClassRepository;
import com.edu.javasb_back.service.RolePermissionService;
import com.edu.javasb_back.service.SysAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@RestController
@RequestMapping("/api/system/user")
public class SysAccountController {

    @Autowired
    private SysAccountRepository sysAccountRepository;
    
    @Autowired
    private SysStudentRepository sysStudentRepository;

    @Autowired
    private StudentParentBindingRepository bindingRepository;

    @Autowired
    private SysAccountService sysAccountService;

    @Autowired
    private SysSchoolRepository sysSchoolRepository;

    @Autowired
    private SysClassRepository sysClassRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RolePermissionService rolePermissionService;

    private static final int PARENT_ROLE_ID = 3;

    // 辅助方法：获取当前用户的实体
    private SysAccount getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String uidStr = authentication.getName();
        try {
            return sysAccountRepository.findById(Long.parseLong(uidStr)).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // 辅助方法：检查权限控制 (低权限不能操作高权限，同级可操作)
    private boolean canManageRole(SysAccount currentUser, Integer targetRoleId) {
        if (currentUser == null || currentUser.getRoleId() == null) {
            return false;
        }
        if (targetRoleId == null) {
            return false;
        }
        return rolePermissionService.canManageRole(currentUser.getRoleId(), targetRoleId);
    }

    private boolean isAdmin(SysAccount currentUser) {
        if (currentUser == null) return false;
        if (currentUser.getRoleId() == null) return false;
        return currentUser.getRoleId() == 1 || currentUser.getRoleId() == 2;
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

        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }

        String finalUserName = (userName != null && !userName.trim().isEmpty()) ? userName : null;
        String finalUserPhone = (userPhone != null && !userPhone.trim().isEmpty()) ? userPhone : null;
        String finalSchoolId = (schoolId != null && !schoolId.trim().isEmpty()) ? schoolId : null;
        String finalClassId = (classId != null && !classId.trim().isEmpty()) ? classId : null;

        Pageable pageable = PageRequest.of(current - 1, size, 
                Sort.by(Sort.Order.asc("role_id"), Sort.Order.desc("create_time")));
        Page<SysAccount> pageData = sysAccountRepository.findAccountsAdvanced(
                finalUserName, finalUserPhone, roleId, finalSchoolId, finalClassId, pageable);

        List<Map<String, Object>> records = pageData.getContent().stream()
                .filter(account -> canManageRole(currentUser, account.getRoleId()))
                .map(account -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", account.getUid());
                    map.put("userName", account.getUsername());
                    map.put("nickName", account.getNickname());
                    map.put("userPhone", account.getPhone());
                    map.put("email", account.getEmail());
                    map.put("userType", String.valueOf(account.getRoleId()));
                    map.put("isVip", account.getIsVip() != null ? account.getIsVip() : 0);
                    map.put("isSvip", account.getIsSvip() != null ? account.getIsSvip() : 0);
                    map.put("isBoundStudent", account.getIsBoundStudent() != null ? account.getIsBoundStudent() : 0);
                    map.put("status", "online".equals(account.getOnlineStatus()) ? "1" : "2");
                    map.put("createTime", account.getCreateTime() != null ? account.getCreateTime().toString() : "");

                    if (account.getRoleId() != null && account.getRoleId() == 3) {
                        List<StudentParentBinding> bindings = bindingRepository.findByParentUid(account.getUid());
                        if (!bindings.isEmpty()) {
                            // 加载绑定的所有学生及其最新的学校班级信息 (从档案表中获取)
                            List<Map<String, Object>> boundStudents = bindings.stream().map(b -> {
                                Optional<SysStudent> sOpt = sysStudentRepository.findById(b.getStudentId());
                                return sOpt.map(s -> {
                                    Map<String, Object> sMap = new HashMap<>();
                                    sMap.put("id", s.getId());
                                    sMap.put("name", s.getName());
                                    
                                    // 核心修改：不再只取冗余字段，而是根据 ID 从学校/班级档案表取最新名称
                                    String schoolName = s.getSchool();
                                    if (s.getSchoolId() != null) {
                                        schoolName = sysSchoolRepository.findBySchoolId(s.getSchoolId())
                                                .map(SysSchool::getName)
                                                .orElse(s.getSchool());
                                    }
                                    
                                    String className = s.getClassName();
                                    if (s.getClassId() != null) {
                                        className = sysClassRepository.findByClassid(s.getClassId())
                                                .map(c -> (c.getGrade() != null ? c.getGrade() + " " : "") + c.getAlias())
                                                .orElse(s.getClassName());
                                    }

                                    sMap.put("school", schoolName);
                                    sMap.put("className", className);
                                    return sMap;
                                }).orElse(null);
                            }).filter(java.util.Objects::nonNull).collect(Collectors.toList());

                            if (!boundStudents.isEmpty()) {
                                Map<String, Object> firstStudent = boundStudents.get(0);
                                map.put("schoolName", firstStudent.get("school"));
                                map.put("className", firstStudent.get("className"));
                                map.put("studentName", firstStudent.get("name"));
                                map.put("boundStudents", boundStudents);
                            }
                        }
                    }
                    return map;
                }).collect(Collectors.toList());

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("records", records);
        resultData.put("total", pageData.getTotalElements());
        resultData.put("current", current);
        resultData.put("size", size);

        return Result.success("获取成功", resultData);
    }

    /**
     * 添加账户
     */
    @LogOperation("添加账户")
    @PreAuthorize("hasAuthority('system:user:add')")
    @PostMapping("/add")
    public Result<Void> addAccount(@RequestBody SysAccount account) {
        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }

        if (account.getRoleId() == null) {
            account.setRoleId(3); // 默认家长
        }

        // 权限校验：不能创建比自己权限高或跨级平级的用户
        // 比如 roleId=2 不能创建 roleId=1
        if (!canManageRole(currentUser, account.getRoleId())) {
            return Result.error(403, "越权操作：您无权创建该等级的角色");
        }

        if (account.getUsername() == null || account.getUsername().isEmpty()) {
            return Result.error("用户名不能为空");
        }
        if (sysAccountRepository.existsByUsername(account.getUsername())) {
            return Result.error("用户名已存在");
        }
        if (account.getPhone() != null && sysAccountRepository.existsByPhone(account.getPhone())) {
            return Result.error("手机号已存在");
        }

        // 默认密码处理，如果没有传密码则默认 123456
        String rawPassword = (account.getPassword() != null && !account.getPassword().isEmpty()) 
                             ? account.getPassword() : "123456";
        account.setPassword(passwordEncoder.encode(rawPassword));

        sysAccountRepository.save(account);

        // 如果是家长角色且传了 studentId，执行绑定逻辑
        if (account.getRoleId() != null && account.getRoleId() == 3 && account.getStudentId() != null) {
            Result<Void> bindRes = sysAccountService.bindStudentById(account.getUid(), account.getStudentId());
            if (bindRes.getCode() != 200) {
                // 如果绑定失败，虽然账户创建成功，但可以考虑是否要提示用户或回滚（此处简单提示）
                return Result.error("账户创建成功，但绑定学生失败：" + bindRes.getMsg());
            }
        }

        return Result.success("添加成功", null);
    }

    /**
     * 批量导入家长用户
     */
    @LogOperation("批量导入家长用户")
    @PreAuthorize("hasAuthority('system:user:import')")
    @PostMapping("/import-parents")
    public Result<Map<String, Object>> importParents(@RequestParam("file") MultipartFile file) {
        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }
        if (file == null || file.isEmpty()) {
            return Result.error("文件内容为空");
        }

        try {
            ParentImportListener listener = new ParentImportListener();
            EasyExcel.read(file.getInputStream(), ParentImportDTO.class, listener).sheet().doRead();

            int successCount = 0;
            int skippedCount = 0;
            int bindFailedCount = 0;
            StringBuilder skippedDetails = new StringBuilder();
            StringBuilder bindFailedDetails = new StringBuilder();

            for (ParentImportDTO dto : listener.getList()) {
                String username = trim(dto.getUsername());
                String nickname = trim(dto.getNickname());
                String phone = trim(dto.getPhone());
                String password = trim(dto.getPassword());
                String studentNo = trim(dto.getStudentNo());

                if (username == null || nickname == null || phone == null) {
                    skippedCount++;
                    appendDetail(skippedDetails, username != null ? username : phone, "必填字段缺失");
                    continue;
                }

                if (!phone.matches("^1[3-9]\\d{9}$")) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "手机号格式不正确");
                    continue;
                }

                if (sysAccountRepository.existsByUsername(username)) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "用户名已存在");
                    continue;
                }

                if (sysAccountRepository.existsByPhone(phone)) {
                    skippedCount++;
                    appendDetail(skippedDetails, username, "手机号已存在");
                    continue;
                }

                SysAccount account = new SysAccount();
                account.setUsername(username);
                account.setNickname(nickname);
                account.setPhone(phone);
                account.setRoleId(PARENT_ROLE_ID);
                account.setIsEnabled(1);
                account.setOnlineStatus("offline");
                account.setIsVip(parseBooleanFlag(dto.getVip()) ? 1 : 0);
                account.setIsSvip(parseBooleanFlag(dto.getSvip()) ? 1 : 0);
                if (account.getIsSvip() == 1) {
                    account.setIsVip(1);
                }

                // 密码处理：如果为空，则使用手机号后6位
                String rawPassword = password;
                if (rawPassword == null || rawPassword.isEmpty()) {
                    if (phone != null && phone.length() >= 6) {
                        rawPassword = phone.substring(phone.length() - 6);
                    } else {
                        rawPassword = "123456"; // 兜底
                    }
                }
                account.setPassword(passwordEncoder.encode(rawPassword));
                sysAccountRepository.save(account);
                successCount++;

                if (studentNo != null) {
                    Optional<SysStudent> studentOpt = sysStudentRepository.findByStudentNo(studentNo);
                    if (studentOpt.isPresent()) {
                        Result<Void> bindResult = sysAccountService.bindStudentById(account.getUid(), studentOpt.get().getId());
                        if (bindResult.getCode() != 200) {
                            bindFailedCount++;
                            appendDetail(bindFailedDetails, username, bindResult.getMsg());
                        }
                    } else {
                        bindFailedCount++;
                        appendDetail(bindFailedDetails, username, "未找到学号为 " + studentNo + " 的学生");
                    }
                }
            }

            StringBuilder message = new StringBuilder("导入完成：成功 ")
                    .append(successCount)
                    .append(" 条，跳过 ")
                    .append(skippedCount)
                    .append(" 条");
            if (bindFailedCount > 0) {
                message.append("，绑定失败 ").append(bindFailedCount).append(" 条");
            }
            if (skippedDetails.length() > 0) {
                message.append("；跳过明细：").append(skippedDetails);
            }
            if (bindFailedDetails.length() > 0) {
                message.append("；绑定明细：").append(bindFailedDetails);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("successCount", successCount);
            data.put("skippedCount", skippedCount);
            data.put("bindFailedCount", bindFailedCount);
            data.put("message", message.toString());

            return Result.success(message.toString(), data);
        } catch (ExcelAnalysisException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("导入失败：" + e.getMessage());
        }
    }

    /**
     * 下载家长导入模板
     */
    @LogOperation("下载家长导入模板")
    @PreAuthorize("hasAuthority('system:user:template')")
    @GetMapping("/download-parent-template")
    public ResponseEntity<Resource> downloadParentTemplate() {
        SysAccount currentUser = getCurrentUser();
        if (!isAdmin(currentUser)) {
            return ResponseEntity.status(403).build();
        }
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
            sampleRow.createCell(4).setCellValue("否");
            sampleRow.createCell(5).setCellValue("否");
            sampleRow.createCell(6).setCellValue("STU2026001");

            Row tipsRow = sheet.createRow(2);
            tipsRow.createCell(0).setCellValue("说明：密码留空默认设为手机号后六位；VIP/SVIP 填 是/否；学生学号可选");

            workbook.write(outputStream);
            String filename = URLEncoder.encode("家长导入模板.xlsx", StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new ByteArrayResource(outputStream.toByteArray()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 编辑账户
     */
    @LogOperation("编辑账户")
    @PreAuthorize("hasAuthority('system:user:edit')")
    @PutMapping("/edit/{uid}")
    public Result<Void> editAccount(@PathVariable Long uid, @RequestBody SysAccount updateData) {
        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }

        Optional<SysAccount> accountOpt = sysAccountRepository.findById(uid);
        if (accountOpt.isEmpty()) {
            return Result.error("账户不存在");
        }

        SysAccount account = accountOpt.get();

        // 权限校验：不能修改比自己权限高的用户（比如 roleId=2 不能修改 roleId=1）
        if (!canManageRole(currentUser, account.getRoleId())) {
            return Result.error(403, "越权操作：您无权修改该等级的角色");
        }

        // 权限校验：也不能通过修改把别人的权限提升到自己无权管理的级别
        if (updateData.getRoleId() != null && !canManageRole(currentUser, updateData.getRoleId())) {
            return Result.error(403, "越权操作：您无权将其角色提升到该等级");
        }

        if (updateData.getNickname() != null) account.setNickname(updateData.getNickname());
        if (updateData.getEmail() != null) account.setEmail(updateData.getEmail());
        
        // 手机号查重
        if (updateData.getPhone() != null && !updateData.getPhone().equals(account.getPhone())) {
            if (sysAccountRepository.existsByPhone(updateData.getPhone())) {
                return Result.error("手机号已被其他用户使用");
            }
            account.setPhone(updateData.getPhone());
        }

        if (updateData.getRoleId() != null) account.setRoleId(updateData.getRoleId());
        
        // 只有传了密码才更新密码
        if (updateData.getPassword() != null && !updateData.getPassword().isEmpty()) {
            account.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }

        sysAccountRepository.save(account);

        // 如果是家长角色且传了 studentId，处理绑定关系
        if (account.getRoleId() != null && account.getRoleId() == 3) {
            // 如果传了具体的 studentId，则更新绑定
            if (updateData.getStudentId() != null && !updateData.getStudentId().isEmpty()) {
                // 先尝试解绑旧的（如果有），再绑定新的
                sysAccountService.unbindStudentByParentUid(uid);
                Result<Void> bindRes = sysAccountService.bindStudentById(uid, updateData.getStudentId());
                if (bindRes.getCode() != 200) {
                    return Result.error("账户更新成功，但绑定学生失败：" + bindRes.getMsg());
                }
            } else if (updateData.getStudentId() != null && updateData.getStudentId().isEmpty()) {
                // 如果传了空字符串，表示主动解绑
                sysAccountService.unbindStudentByParentUid(uid);
            }
        }

        return Result.success("编辑成功", null);
    }

    /**
     * 删除账户
     */
    @LogOperation("删除账户")
    @PreAuthorize("hasAuthority('system:user:delete')")
    @DeleteMapping("/delete/{uid}")
    public Result<Void> deleteAccount(@PathVariable Long uid) {
        SysAccount currentUser = getCurrentUser();
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        if (!isAdmin(currentUser)) {
            return Result.error(403, "无权限执行此操作，仅管理员可用");
        }

        Optional<SysAccount> targetOpt = sysAccountRepository.findById(uid);
        if (targetOpt.isEmpty()) {
            return Result.error("账户不存在");
        }
        
        SysAccount targetAccount = targetOpt.get();

        // 权限校验：不能删除比自己权限高的用户
        if (!canManageRole(currentUser, targetAccount.getRoleId())) {
            return Result.error(403, "越权操作：您无权删除该等级的角色");
        }

        // 防止自己删自己
        if (currentUser.getUid().equals(uid)) {
            return Result.error("不能删除当前登录的账户");
        }

        // 如果是家长角色，先解绑学生关系
        if (targetAccount.getRoleId() != null && targetAccount.getRoleId() == 3) {
            sysAccountService.unbindStudentByParentUid(uid);
        }

        sysAccountRepository.deleteById(uid);
        return Result.success("删除成功", null);
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean parseBooleanFlag(String value) {
        if (value == null) return false;
        String normalized = value.trim();
        return "1".equals(normalized) ||
                "是".equals(normalized) ||
                "true".equalsIgnoreCase(normalized) ||
                "yes".equalsIgnoreCase(normalized) ||
                "y".equalsIgnoreCase(normalized);
    }

    private void appendDetail(StringBuilder builder, String key, String message) {
        if (builder.length() > 0) {
            builder.append("；");
        }
        builder.append("[").append(key != null ? key : "未知").append(": ").append(message).append("]");
    }
}
