import api from '@/utils/http'
import { mockLoginData } from '@/mock/auth/login'

export async function fetchGetRoles() {
  return api.get<any>({
    url: '/api/admin/auth/roles'
  })
}

export async function fetchLogin(params: Api.Auth.LoginParams) {
  return api.post<any>({
    url: '/api/admin/auth/login',
    data: {
      username: params.userName,
      password: params.password,
      roleId: params.roleId
    }
  })
}

export async function fetchUpdateBasicInfo(uid: number, data: { nickname: string; phone: string; email: string }) {
  return api.put<any>({
    url: `/api/auth/userInfo/${uid}`,
    data
  })
}

export async function fetchUpdatePassword(data: { oldPassword: string; newPassword: string }) {
  return api.put<any>({
    url: '/api/auth/password',
    data
  })
}

const mapRoleCodeToFrontendRoles = (roleCode?: string) => {
  if (roleCode === 'super_admin') return ['R_SUPER']
  if (roleCode === 'admin') return ['R_ADMIN']
  if (roleCode === 'parent') return ['R_PARENT']
  return ['R_USER']
}

export async function fetchGetUserInfo() {
  const userInfo = await api.get<any>({
    url: '/api/auth/info'
  })

  if (userInfo) {
    const permissions = Array.isArray(userInfo.permissions) ? userInfo.permissions : []

    return {
      ...mockLoginData.admin.userInfo,
      userId: userInfo.uid,
      userName: userInfo.username,
      nickName: userInfo.nickname,
      phone: userInfo.phone,
      userPhone: userInfo.phone,
      email: userInfo.email,
      avatar: userInfo.avatar,
      roleCode: userInfo.roleCode,
      permissions,
      buttons: permissions,
      roles: mapRoleCodeToFrontendRoles(userInfo.roleCode)
    }
  }

  return {
    ...mockLoginData.admin.userInfo,
    permissions: Array.isArray((mockLoginData.admin.userInfo as any)?.permissions)
      ? (mockLoginData.admin.userInfo as any).permissions
      : [],
    buttons: Array.isArray((mockLoginData.admin.userInfo as any)?.buttons)
      ? (mockLoginData.admin.userInfo as any).buttons
      : []
  }
}
