package com.edu.javasb_back.service.support;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TaskProgressManager {

    private final Map<String, TaskStatus> tasks = new ConcurrentHashMap<>();

    public void initTask(String taskId, String taskName, int total) {
        TaskStatus status = new TaskStatus();
        status.setTaskId(taskId);
        status.setTaskName(taskName);
        status.setTotal(total);
        status.setCurrent(0);
        status.setStatus("processing");
        status.setLogs(new ArrayList<>());
        tasks.put(taskId, status);
    }

    public void updateProgress(String taskId, int current, String log) {
        TaskStatus status = tasks.get(taskId);
        if (status != null) {
            status.setCurrent(current);
            if (log != null) {
                status.getLogs().add(log);
            }
            if (status.getTotal() > 0 && current >= status.getTotal()) {
                status.setStatus("completed");
            }
        }
    }

    public void addLog(String taskId, String log) {
        TaskStatus status = tasks.get(taskId);
        if (status != null) {
            status.getLogs().add(log);
        }
    }

    public void finishTask(String taskId, String finalStatus) {
        TaskStatus status = tasks.get(taskId);
        if (status != null) {
            status.setStatus(finalStatus);
        }
    }

    public void finishTask(String taskId, String finalStatus, Object result) {
        TaskStatus status = tasks.get(taskId);
        if (status != null) {
            status.setStatus(finalStatus);
            status.setResult(result);
            if ("completed".equals(finalStatus) && status.getTotal() > 0) {
                status.setCurrent(status.getTotal());
            }
        }
    }

    public TaskStatus getTaskStatus(String taskId) {
        return tasks.get(taskId);
    }

    public void removeTask(String taskId) {
        tasks.remove(taskId);
    }

    @Data
    public static class TaskStatus {
        private String taskId;
        private String taskName;
        private int total;
        private int current;
        private String status; // processing, completed, failed
        private List<String> logs;
        private Object result;
    }
}
