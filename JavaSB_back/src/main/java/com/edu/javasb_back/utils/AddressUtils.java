package com.edu.javasb_back.utils;

import lombok.extern.slf4j.Slf4j;
import org.lionsoul.ip2region.xdb.Searcher;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.io.InputStream;

@Slf4j
public class AddressUtils {

    private static Searcher searcher;

    static {
        try {
            // 加载 ip2region.xdb 文件
            ClassPathResource resource = new ClassPathResource("ip2region/ip2region.xdb");
            if (resource.exists()) {
                InputStream inputStream = resource.getInputStream();
                byte[] cBuff = FileCopyUtils.copyToByteArray(inputStream);
                searcher = Searcher.newWithBuffer(cBuff);
                log.info("ip2region.xdb 加载成功");
            } else {
                log.warn("ip2region.xdb 文件不存在，请在 resources/ip2region 目录下放置该文件");
            }
        } catch (Exception e) {
            log.error("ip2region 初始化失败: {}", e.getMessage());
        }
    }

    /**
     * 根据 IP 获取地理位置
     *
     * @param ip IP 地址
     * @return 地理位置，例如：中国|0|广东省|深圳市|电信
     */
    public static String getRealAddressByIP(String ip) {
        if (searcher == null || ip == null || ip.isEmpty() || "127.0.0.1".equals(ip) || "localhost".equals(ip)) {
            return "内网IP";
        }
        try {
            String region = searcher.search(ip);
            if (region != null) {
                // 格式化输出，例如：广东省|深圳市
                String[] parts = region.split("\\|");
                StringBuilder sb = new StringBuilder();
                if (!"0".equals(parts[2])) sb.append(parts[2]); // 省份
                if (!"0".equals(parts[3])) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(parts[3]); // 城市
                }
                return sb.length() > 0 ? sb.toString() : "未知地点";
            }
        } catch (Exception e) {
            log.error("IP 解析失败: {}, ip: {}", e.getMessage(), ip);
        }
        return "未知地点";
    }
}
