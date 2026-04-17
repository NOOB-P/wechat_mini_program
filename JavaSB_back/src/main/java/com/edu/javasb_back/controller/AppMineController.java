package com.edu.javasb_back.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.dto.AccountUpdateDTO;
import com.edu.javasb_back.model.dto.PasswordUpdateDTO;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.vo.AppNotificationVO;
import com.edu.javasb_back.service.AppNotificationService;
import com.edu.javasb_back.service.SysAccountService;

/**
 * 小程序端个人中心/设置控制器
 */
@RestController
@RequestMapping("/api/app/mine")
public class AppMineController {

    @Autowired
    private SysAccountService sysAccountService;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Autowired
    private AppNotificationService appNotificationService;

    // 辅助方法：获取当前用户的 UID
    private Long getCurrentUid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String uidStr = authentication.getName();
        try {
            return Long.parseLong(uidStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 获取当前用户信息
     */
    @LogOperation("小程序获取个人信息")
    @GetMapping("/info")
    public Result<SysAccount> getMineInfo() {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.getUserInfo(uid);
    }

    /**
     * 获取当前用户通知列表
     */
    @LogOperation("小程序获取通知列表")
    @GetMapping("/notifications")
    public Result<List<AppNotificationVO>> getMineNotifications(@RequestParam(required = false) Integer limit) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "未登录");
        }
        return Result.success("获取通知成功", appNotificationService.getUserNotifications(uid, limit));
    }

    /**
     * 更新当前用户基本信息 (昵称, 邮箱等)
     */
    @LogOperation("小程序更新个人信息")
    @PostMapping("/update")
    public Result<Void> updateMineInfo(@RequestBody AccountUpdateDTO updateDTO) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.updateBasicInfo(uid, updateDTO);
    }

    /**
     * 账户设置 (目前主要处理密码修改)
     */
    @LogOperation("小程序修改密码")
    @PostMapping("/settings")
    public Result<Void> updateMineSettings(@RequestBody PasswordUpdateDTO passwordDTO) {
        Long uid = getCurrentUid();
        if (uid == null) {
            return Result.error(401, "未登录");
        }
        return sysAccountService.updatePassword(uid, passwordDTO.getOldPassword(), passwordDTO.getNewPassword());
    }

    /**
     * 上传头像
     */
    @LogOperation("小程序上传头像")
    @PostMapping("/upload")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("上传文件为空");
        }

        // 确定上传目录
        String uploadDir = globalConfigProperties.getUploadDir();
        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString().replace("-", "") + extension;

        // 保存文件
        try {
            file.transferTo(new File(folder.getAbsolutePath() + File.separator + fileName));
            // 统一返回相对路径，由前端基于当前服务地址拼接，避免写死本机地址
            String avatarUrl = "/uploads/code/" + fileName;
            return Result.success("上传成功", avatarUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    /**
     * 退出登录
     */
    @LogOperation("小程序退出登录")
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.replace("Bearer ", "").trim();
            return sysAccountService.logout(token);
        }
        return Result.success("退出成功", null);
    }
}
