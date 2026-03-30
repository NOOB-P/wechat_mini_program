import api from '@/utils/http'
import { mockLoginData } from '@/mock/auth/login'

/**
 * 登录接口
 * @param params 登录参数
 * @returns 登录响应
 */
export async function fetchLogin(params: Api.Auth.LoginParams) {
  // 连接真实后端
  return api.post<any>({
    url: '/api/admin/auth/login',
    data: {
      username: params.userName,
      password: params.password
    }
  })
}

/**
 * 更新当前用户基本信息
 */
export async function fetchUpdateBasicInfo(uid: number, data: { nickname: string; phone: string; email: string }) {
  return api.put<any>({
    url: `/api/auth/userInfo/${uid}`,
    data
  })
}
export async function fetchGetUserInfo() {
  // 从真实后端获取当前登录用户信息
  const res = await api.get<any>({
    url: '/api/auth/info'
  })
  
  if (res.code === 200 && res.data) {
    const userInfo = res.data
    // 为了兼容前端已有的 mock 数据结构，我们将获取到的信息与 mock 数据合并
    // 主要是为了保留 mock 里的 roles, permissions, menus 等前端路由必须的数据
    const mergedUserInfo = {
      ...mockLoginData.admin.userInfo,
      userId: userInfo.uid,
      userName: userInfo.username,
      nickName: userInfo.nickname,
      phone: userInfo.phone,
      userPhone: userInfo.phone,
      email: userInfo.email,
      roles: userInfo.roleId === 1 ? ['R_SUPER'] : userInfo.roleId === 2 ? ['R_ADMIN'] : ['R_USER']
    }
    return mergedUserInfo
  }

  return mockLoginData.admin.userInfo
}
