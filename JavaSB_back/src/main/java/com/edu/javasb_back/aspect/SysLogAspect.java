package com.edu.javasb_back.aspect;

import com.edu.javasb_back.annotation.LogOperation;
import com.edu.javasb_back.model.entity.SysAccount;
import com.edu.javasb_back.model.entity.SysLog;
import com.edu.javasb_back.repository.SysAccountRepository;
import com.edu.javasb_back.repository.SysLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Optional;

@Aspect
@Component
public class SysLogAspect {

    @Autowired
    private SysLogRepository sysLogRepository;

    @Autowired
    private SysAccountRepository sysAccountRepository;

    // 定义切点，拦截 Controller 下的所有方法
    @Pointcut("execution(* com.edu.javasb_back.controller..*.*(..))")
    public void logPointCut() {}

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = null;
        Integer status = 200;

        try {
            // 执行方法
            result = point.proceed();
        } catch (Throwable e) {
            status = 500;
            throw e;
        } finally {
            // 保存日志
            saveSysLog(point, status);
        }

        return result;
    }

    private void saveSysLog(ProceedingJoinPoint joinPoint, Integer status) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        SysLog sysLog = new SysLog();
        LogOperation logOperation = method.getAnnotation(LogOperation.class);
        if (logOperation != null) {
            sysLog.setOperation(logOperation.value());
        } else {
            // 如果没有注解，默认记录方法名
            sysLog.setOperation(signature.getName());
        }

        // 获取 request
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            sysLog.setIp(getIpAddr(request));
            sysLog.setMethod(request.getMethod());
            sysLog.setUrl(request.getRequestURI());
        }

        sysLog.setStatus(status);

        // 从 SecurityContext 获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            Optional<SysAccount> accountOpt = sysAccountRepository.findByUsername(username);
            if (accountOpt.isPresent()) {
                SysAccount account = accountOpt.get();
                sysLog.setUid(account.getUid());
                sysLog.setUserName(account.getUsername());
                sysLog.setNickName(account.getNickname());
            } else {
                sysLog.setUserName(username);
                sysLog.setNickName("未知用户");
            }
        } else {
            // 未登录时的请求（如登录接口本身）
            sysLog.setUserName("系统记录");
            sysLog.setNickName("未登录/游客");
        }

        // 设置一个默认地址
        sysLog.setLocation("未知");

        // 保存到数据库
        sysLogRepository.save(sysLog);
    }

    // 获取真实IP地址
    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0.0.0.0".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }
}
