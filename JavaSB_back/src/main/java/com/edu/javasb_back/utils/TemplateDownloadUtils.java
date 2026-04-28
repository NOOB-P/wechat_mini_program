package com.edu.javasb_back.utils;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class TemplateDownloadUtils {

    private TemplateDownloadUtils() {
    }

    public static ResponseEntity<Resource> buildDownloadResponse(List<String> classPathCandidates, String downloadName) {
        try {
            for (String candidate : classPathCandidates) {
                Resource resource = new ClassPathResource(candidate);
                if (!resource.exists()) {
                    continue;
                }

                String encodedName = URLEncoder.encode(downloadName, StandardCharsets.UTF_8)
                        .replace("+", "%20");

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
