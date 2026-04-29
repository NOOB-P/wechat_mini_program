package com.edu.javasb_back.controller;

import com.edu.javasb_back.common.Result;
import com.edu.javasb_back.service.support.TaskProgressManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/task")
public class TaskController {

    @Autowired
    private TaskProgressManager taskProgressManager;

    @GetMapping("/progress/{taskId}")
    public Result<TaskProgressManager.TaskStatus> getProgress(@PathVariable String taskId) {
        TaskProgressManager.TaskStatus status = taskProgressManager.getTaskStatus(taskId);
        if (status == null) {
            return Result.error("任务不存在或已过期");
        }
        return Result.success(status);
    }
}
