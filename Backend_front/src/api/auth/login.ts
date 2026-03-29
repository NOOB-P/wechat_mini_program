import { mockLoginData } from '@/mock/auth/login'

/**
 * 登录接口
 * @param params 登录参数
 * @returns 登录响应
 */
export async function fetchLogin(params: Api.Auth.LoginParams) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  const { userName } = params
  
  // 模拟登录逻辑
  if (userName.toLowerCase() === 'admin') {
    return {
      token: mockLoginData.admin.token,
      refreshToken: mockLoginData.admin.refreshToken
    }
  } else if (userName.toLowerCase() === 'school') {
    return {
      token: mockLoginData.school.token,
      refreshToken: mockLoginData.school.refreshToken
    }
  }

  throw new Error('用户名或密码错误')
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export async function fetchGetUserInfo() {
  // 实际开发中会根据 token 获取用户信息
  // 这里简单模拟
  return mockLoginData.admin.userInfo
}
