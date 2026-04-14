package com.edu.javasb_back.controller;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.WechatConfig;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.WechatConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer/wechat")
public class WechatConfigController {

    @Autowired
    private WechatConfigRepository wechatConfigRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }
        String uidStr = authentication.getName();
        try {
            Optional<SysAccount> currentUserOpt = sysAccountRepository.findById(Long.parseLong(uidStr));
            return currentUserOpt.isPresent() && currentUserOpt.get().getRoleId() != null &&
                    (currentUserOpt.get().getRoleId() == 1 || currentUserOpt.get().getRoleId() == 2);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @LogOperation("查询微信群配置列表")
    @GetMapping("/list")
    public Result<List<WechatConfig>> getList() {
        return Result.success("获取成功", wechatConfigRepository.findAllByOrderByUpdateTimeDesc());
    }

    @LogOperation("查询启用的微信群配置")
    @GetMapping("/active")
    public Result<List<WechatConfig>> getActiveList() {
        return Result.success("获取成功", wechatConfigRepository.findByStatusOrderByUpdateTimeDesc(1));
    }

    @LogOperation("根据位置获取二维码")
    @GetMapping("/get-by-location")
    public Result<WechatConfig> getByLocation(@RequestParam String location) {
        List<WechatConfig> list = wechatConfigRepository.findByDisplayLocationAndStatusOrderByUpdateTimeDesc(location, 1);
        if (list.isEmpty()) {
            return Result.error("暂无配置");
        }
        WechatConfig config = list.get(0);
        config.setQrCodePath(normalizeQrCodePath(config.getQrCodePath()));
        return Result.success("获取成功", config);
    }

    @LogOperation("上传二维码图片")
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");
        if (file.isEmpty()) return Result.error("文件不能为空");

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String uploadDir = globalConfigProperties.getUploadDir();
            
            // 确保目录存在
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            Path path = Paths.get(uploadDir, fileName);
            Files.write(path, file.getBytes());

            // 保存到 code 目录时返回明确路径，避免前后端路径歧义
            return Result.success("上传成功", "/uploads/code/" + fileName);
        } catch (IOException e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @LogOperation("新增微信群配置")
    @PostMapping("/add")
    public Result<Void> add(@RequestBody WechatConfig config) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");
        if (config.getGroupName() == null || config.getGroupName().isEmpty()) return Result.error("群名称不能为空");
        if (config.getQrCodePath() == null || config.getQrCodePath().isEmpty()) return Result.error("请先上传二维码");
        
        wechatConfigRepository.save(config);
        return Result.success("添加成功", null);
    }

    @LogOperation("修改微信群配置")
    @PutMapping("/edit/{id}")
    public Result<Void> edit(@PathVariable Integer id, @RequestBody WechatConfig updateData) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");
        Optional<WechatConfig> configOpt = wechatConfigRepository.findById(id);
        if (configOpt.isEmpty()) return Result.error("配置不存在");

        WechatConfig config = configOpt.get();
        if (updateData.getGroupName() != null) config.setGroupName(updateData.getGroupName());
        if (updateData.getQrCodePath() != null) config.setQrCodePath(updateData.getQrCodePath());
        if (updateData.getStatus() != null) config.setStatus(updateData.getStatus());
        if (updateData.getDisplayLocation() != null) config.setDisplayLocation(updateData.getDisplayLocation());

        wechatConfigRepository.save(config);
        return Result.success("修改成功", null);
    }

    @LogOperation("删除微信群配置")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        if (!isAdmin()) return Result.error(403, "无权限执行此操作");
        Optional<WechatConfig> configOpt = wechatConfigRepository.findById(id);
        if (configOpt.isPresent()) {
            // 可选：删除本地物理文件
            String qrPath = normalizeQrCodePath(configOpt.get().getQrCodePath());
            String absolutePath = resolveUploadAbsolutePath(qrPath);
            if (absolutePath != null) {
                File file = new File(absolutePath);
                if (file.exists()) file.delete();
            }
            wechatConfigRepository.deleteById(id);
        }
        return Result.success("删除成功", null);
    }

    private String normalizeQrCodePath(String qrCodePath) {
        if (qrCodePath == null || qrCodePath.isBlank()) {
            return qrCodePath;
        }

        String normalizedPath = qrCodePath.trim();
        int uploadsIndex = normalizedPath.indexOf("/uploads/");
        if (uploadsIndex != -1) {
            normalizedPath = normalizedPath.substring(uploadsIndex);
        }

        if (!normalizedPath.startsWith("/uploads/")) {
            return normalizedPath;
        }
        if (normalizedPath.startsWith("/uploads/code/") || normalizedPath.startsWith("/uploads/papers/")) {
            return normalizedPath;
        }

        String fileName = normalizedPath.substring("/uploads/".length());
        File legacyFile = new File(resolveUploadRootDir(), fileName);
        if (legacyFile.exists()) {
            return normalizedPath;
        }

        File codeFile = new File(globalConfigProperties.getUploadDir(), fileName);
        if (codeFile.exists()) {
            return "/uploads/code/" + fileName;
        }

        return normalizedPath;
    }

    private String resolveUploadAbsolutePath(String uploadPath) {
        if (uploadPath == null || uploadPath.isBlank()) {
            return null;
        }

        String normalizedPath = normalizeQrCodePath(uploadPath);
        if (normalizedPath == null || !normalizedPath.startsWith("/uploads/")) {
            return null;
        }
        if (normalizedPath.startsWith("/uploads/code/")) {
            return Paths.get(globalConfigProperties.getUploadDir(), normalizedPath.substring("/uploads/code/".length())).toString();
        }
        if (normalizedPath.startsWith("/uploads/papers/")) {
            return Paths.get(globalConfigProperties.getPaperDir(), normalizedPath.substring("/uploads/papers/".length())).toString();
        }
        return Paths.get(resolveUploadRootDir(), normalizedPath.substring("/uploads/".length())).toString();
    }

    private String resolveUploadRootDir() {
        File uploadDir = new File(globalConfigProperties.getUploadDir());
        File parentDir = uploadDir.getParentFile();
        if (parentDir != null) {
            return parentDir.getAbsolutePath();
        }
        return uploadDir.getAbsolutePath();
    }
}
