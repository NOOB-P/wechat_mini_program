import request from '@/utils/request'

/**
 * @Description: 发送验证码
 * @param {string} phone 手机号
 */
export const sendSmsCode = (phone: string) => {
  return request({
    url: '/auth/sendCode',
    method: 'POST',
    data: { phone }
  })
}

/**
 * @Description: 快捷登录
 * @param {object} data { phone, code }
 */
export const loginByPhone = (data: { phone: string; code: string }) => {
  return request({
    url: '/auth/login/phone',
    method: 'POST',
    data
  })
}

/**
 * @Description: 账号登录
 * @param {object} data { account, password }
 */
export const loginByPassword = (data: { account: string; password: string }) => {
  return request({
    url: '/auth/login/password',
    method: 'POST',
    data
  })
}
