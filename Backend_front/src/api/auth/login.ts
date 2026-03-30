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
  // 我们暂时先不从后端获取所有权限菜单，直接用前端 mock 的全量权限数据，避免改动过大导致前端跑不起来
  // 这里依然保留 mock 数据保证后台正常渲染，后续如果需要对接真实的菜单可以再替换
  return mockLoginData.admin.userInfo
}
