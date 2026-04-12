import request from '@/utils/request'

export const sendSmsCode = (phone: string) => {
  return request({
    url: '/api/app/auth/sendCode',
    method: 'POST',
    data: { phone }
  })
}

export const loginByPhone = (data: { phone: string; code: string }) => {
  return request({
    url: '/api/app/auth/login/phone',
    method: 'POST',
    data
  })
}

export const loginByPassword = (data: { phone: string; password: string }) => {
  return request({
    url: '/api/app/auth/login/password',
    method: 'POST',
    data
  })
}

export const register = (data: { phone: string; password: string; nickname?: string; code: string }) => {
  return request({
    url: '/api/app/auth/register',
    method: 'POST',
    data
  })
}

export const forgotPassword = (data: { phone: string; password?: string; code?: string }) => {
  return request({
    url: '/login/forgotPassword',
    method: 'POST',
    data
  })
}

export const loginByWechat = (code: string) => {
  return request({
    url: '/api/app/auth/login/wechat',
    method: 'POST',
    data: { code }
  })
}

export const loginByWechatPhone = (data: { phoneCode: string; wxCode: string }) => {
  return request({
    url: '/api/app/auth/login/wechat/phone',
    method: 'POST',
    data
  })
}

export const thirdPartyLoginApi = (type: string, code: string) => {
  if (type === 'wechat') {
    return loginByWechat(code)
  }
  return request({
    url: '/api/app/auth/login/thirdParty',
    method: 'POST',
    data: { type, code }
  })
}

export const bindThirdPartyPhone = (data: {
  phone: string
  code: string
  openid: string
  type?: string
}) => {
  return request({
    url: '/api/app/auth/login/wechat/bind-phone',
    method: 'POST',
    data
  })
}

export const logout = () => {
  return request({
    url: '/api/auth/logout',
    method: 'POST'
  })
}
