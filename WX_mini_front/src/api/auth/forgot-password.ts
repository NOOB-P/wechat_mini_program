import request from '@/utils/request'

/**
 * @Description: 忘记密码 - 发送验证码
 * @param {string} phone 手机号
 */
export const sendForgotPasswordCode = (phone: string) => {
  return request({
    url: '/auth/forgot-password/sendCode',
    method: 'POST',
    data: { phone }
  })
}

/**
 * @Description: 忘记密码 - 重置密码
 * @param {object} data { phone, code, password }
 */
export const resetPassword = (data: { phone: string; code: string; password: string }) => {
  return request({
    url: '/auth/forgot-password/reset',
    method: 'POST',
    data
  })
}
