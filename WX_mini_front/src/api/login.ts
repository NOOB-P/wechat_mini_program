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
 * @Description: 注册账号
 * @param {string} phone 手机号
 * @param {string} password 密码
 * @param {string} nickname 昵称
 * @param {string} code 验证码
 */
export const register = (data: { phone: string; password?: string; nickname?: string; code?: string }) => {
  return request({
    url: '/login/register',
    method: 'POST',
    data
  })
}

/**
 * @Description: 找回密码
 * @param {string} phone 手机号
 * @param {string} password 新密码
 * @param {string} code 验证码
 */
export const forgotPassword = (data: { phone: string; password?: string; code?: string }) => {
  return request({
    url: '/login/forgotPassword',
    method: 'POST',
    data
  })
}

/**
 * @Description: 第三方登录
 * @param {string} type 登录类型 wechat | qq
 * @param {string} openid 第三方唯一标识
 */
export const thirdPartyLoginApi = (type: string, openid: string) => {
  return request({
    url: '/login/thirdParty',
    method: 'POST',
    data: { type, openid }
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
