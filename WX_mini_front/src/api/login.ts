import request from '@/utils/request'
import type { resultData } from '@/types/request'

/**
 * @Description: 发送验证码
 * @param {string} phone 手机号
 */
export const sendSmsCode = (phone: string) => {
  return request({
    url: '/login/sendCode',
    method: 'POST',
    data: { phone }
  })
}

/**
 * @Description: 验证码登录
 * @param {string} phone 手机号
 * @param {string} code 验证码
 */
export const loginByPhone = (phone: string, code: string) => {
  return request({
    url: '/login/phone',
    method: 'POST',
    data: { phone, code }
  })
}

/**
 * @Description: 密码登录
 * @param {string} phone 手机号
 * @param {string} password 密码
 */
export const loginByPassword = (phone: string, password: string) => {
  return request({
    url: '/login/password',
    method: 'POST',
    data: { phone, password }
  })
}

/**
 * @Description: 退出登录
 */
export const logout = () => {
  return request({
    url: '/login/logout',
    method: 'POST'
  })
}
