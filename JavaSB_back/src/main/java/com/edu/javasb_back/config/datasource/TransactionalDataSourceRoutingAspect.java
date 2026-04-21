package com.edu.javasb_back.config.datasource;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.dynamic.datasource.toolkit.DynamicDataSourceContextHolder;
import java.lang.reflect.Method;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class TransactionalDataSourceRoutingAspect {

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    public Object routeDataSource(ProceedingJoinPoint joinPoint) throws Throwable {
        if (hasExplicitDataSource(joinPoint)) {
            return joinPoint.proceed();
        }

        Transactional transactional = resolveTransactional(joinPoint);
        if (transactional == null) {
            return joinPoint.proceed();
        }

        DynamicDataSourceContextHolder.push(transactional.readOnly() ? DataSourceName.SLAVE : DataSourceName.MASTER);
        try {
            return joinPoint.proceed();
        } finally {
            DynamicDataSourceContextHolder.poll();
        }
    }

    private boolean hasExplicitDataSource(ProceedingJoinPoint joinPoint) {
        Method method = getTargetMethod(joinPoint);
        Class<?> targetClass = getTargetClass(joinPoint);
        return AnnotatedElementUtils.hasAnnotation(method, DS.class)
                || AnnotatedElementUtils.hasAnnotation(targetClass, DS.class);
    }

    private Transactional resolveTransactional(ProceedingJoinPoint joinPoint) {
        Method method = getTargetMethod(joinPoint);
        Transactional methodTransactional = AnnotatedElementUtils.findMergedAnnotation(method, Transactional.class);
        if (methodTransactional != null) {
            return methodTransactional;
        }
        return AnnotatedElementUtils.findMergedAnnotation(getTargetClass(joinPoint), Transactional.class);
    }

    private Method getTargetMethod(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        return AopUtils.getMostSpecificMethod(signature.getMethod(), getTargetClass(joinPoint));
    }

    private Class<?> getTargetClass(ProceedingJoinPoint joinPoint) {
        return AopUtils.getTargetClass(joinPoint.getTarget());
    }
}
