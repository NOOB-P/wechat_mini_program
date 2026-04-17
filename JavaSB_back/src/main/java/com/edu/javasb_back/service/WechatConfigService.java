package com.edu.javasb_back.service;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.model.entity.WechatConfig;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface WechatConfigService {
    Result<List<WechatConfig>> getList();

    Result<List<WechatConfig>> getActiveList();

    Result<WechatConfig> getByLocation(String location);

    Result<String> upload(Long currentUid, MultipartFile file);

    Result<Void> add(Long currentUid, WechatConfig config);

    Result<Void> edit(Long currentUid, Integer id, WechatConfig updateData);

    Result<Void> delete(Long currentUid, Integer id);
}
