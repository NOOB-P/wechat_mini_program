package com.edu.javasb_back.service.impl;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.config.GlobalConfigProperties;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.WechatConfig;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.WechatConfigRepository;
import com.edu.javasb_back.service.WechatConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class WechatConfigServiceImpl implements WechatConfigService {

    @Autowired
    private WechatConfigRepository wechatConfigRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    @Autowired
    private GlobalConfigProperties globalConfigProperties;

    @Override
    public Result<List<WechatConfig>> getList() {
        return Result.success("获取成功", wechatConfigRepository.findAllByOrderByUpdateTimeDesc());
    }

    @Override
    public Result<List<WechatConfig>> getActiveList() {
        return Result.success("获取成功", wechatConfigRepository.findByStatusOrderByUpdateTimeDesc(1));
    }

    @Override
    public Result<WechatConfig> getByLocation(String location) {
        List<WechatConfig> list = wechatConfigRepository.findByDisplayLocationAndStatusOrderByUpdateTimeDesc(location, 1);
        if (list.isEmpty()) {
            return Result.error("暂无配置");
        }
        WechatConfig config = list.get(0);
        config.setQrCodePath(normalizeQrCodePath(config.getQrCodePath()));
        return Result.success("获取成功", config);
    }

    @Override
    public Result<String> upload(Long currentUid, MultipartFile file) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return Result.error(adminResult.getCode(), adminResult.getMsg());
        }
        if (file == null || file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String uploadDir = globalConfigProperties.getUploadDir();
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            Path path = Paths.get(uploadDir, fileName);
            Files.write(path, file.getBytes());
            return Result.success("上传成功", "/uploads/code/" + fileName);
        } catch (IOException e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Void> add(Long currentUid, WechatConfig config) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        if (!StringUtils.hasText(config.getGroupName())) {
            return Result.error("群名称不能为空");
        }
        if (!StringUtils.hasText(config.getQrCodePath())) {
            return Result.error("请先上传二维码");
        }
        wechatConfigRepository.save(config);
        return Result.success("添加成功", null);
    }

    @Override
    @Transactional
    public Result<Void> edit(Long currentUid, Integer id, WechatConfig updateData) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        WechatConfig config = wechatConfigRepository.findById(id).orElse(null);
        if (config == null) {
            return Result.error("配置不存在");
        }
        if (updateData.getGroupName() != null) {
            config.setGroupName(updateData.getGroupName());
        }
        if (updateData.getQrCodePath() != null) {
            config.setQrCodePath(updateData.getQrCodePath());
        }
        if (updateData.getStatus() != null) {
            config.setStatus(updateData.getStatus());
        }
        if (updateData.getDisplayLocation() != null) {
            config.setDisplayLocation(updateData.getDisplayLocation());
        }
        wechatConfigRepository.save(config);
        return Result.success("修改成功", null);
    }

    @Override
    @Transactional
    public Result<Void> delete(Long currentUid, Integer id) {
        Result<Void> adminResult = requireAdmin(currentUid);
        if (adminResult.getCode() != 200) {
            return adminResult;
        }
        WechatConfig config = wechatConfigRepository.findById(id).orElse(null);
        if (config != null) {
            String absolutePath = resolveUploadAbsolutePath(config.getQrCodePath());
            if (absolutePath != null) {
                File file = new File(absolutePath);
                if (file.exists()) {
                    file.delete();
                }
            }
            wechatConfigRepository.deleteById(id);
        }
        return Result.success("删除成功", null);
    }

    private Result<Void> requireAdmin(Long currentUid) {
        if (currentUid == null) {
            return Result.error(401, "未登录");
        }
        SysAccount currentUser = sysAccountRepository.findById(currentUid).orElse(null);
        if (currentUser == null) {
            return Result.error(401, "未登录");
        }
        Integer roleId = currentUser.getRoleId();
        if (roleId == null || (roleId != 1 && roleId != 2)) {
            return Result.error(403, "无权限执行此操作");
        }
        return Result.success("校验通过", null);
    }

    private String normalizeQrCodePath(String qrCodePath) {
        if (!StringUtils.hasText(qrCodePath)) {
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
        if (!StringUtils.hasText(uploadPath)) {
            return null;
        }
        String normalizedPath = normalizeQrCodePath(uploadPath);
        if (!StringUtils.hasText(normalizedPath) || !normalizedPath.startsWith("/uploads/")) {
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
        return parentDir != null ? parentDir.getAbsolutePath() : uploadDir.getAbsolutePath();
    }
}
