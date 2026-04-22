package com.edu.javasb_back.common;

import lombok.Data;

/**
 * 统一返回结果类
 * @param <T>
 */
@Data
public class Result<T> {
    public static final Integer CODE_WECHAT_BIND_REQUIRED = 40101;

    private Integer code;
    private String msg;
    private T data;

    public Result() {}

    public Result(Integer code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public Integer getCode() { return code; }
    public void setCode(Integer code) { this.code = code; }
    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }

    public static <T> Result<T> success(String msg, T data) {
        return new Result<>(200, msg, data);
    }

    public static <T> Result<T> error(String msg) {
        return new Result<>(500, msg, null);
    }

    public static <T> Result<T> error(Integer code, String msg) {
        return new Result<>(code, msg, null);
    }

    public static <T> Result<T> wechatBindRequired(String msg) {
        return new Result<>(CODE_WECHAT_BIND_REQUIRED, msg, null);
    }
}
