import api from '@/utils/http'
import { mockUserList } from '@/mock/system/user'

/** 获取用户列表 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  // 对接真实后端接口
  return api.get<any>({
    url: '/api/system/user/list',
    params
  })
}

/** 添加用户 */
export function fetchAddUser(data: any) {
  return api.post<any>({
    url: '/api/system/user/add',
    data: {
      username: data.userName,
      nickname: data.nickName,
      phone: data.userPhone,
      email: data.email,
      roleId: data.userType,
      password: data.password
    }
  })
}

/** 编辑用户 */
export function fetchEditUser(id: number, data: any) {
  return api.put<any>({
    url: `/api/system/user/edit/${id}`,
    data: {
      nickname: data.nickName,
      phone: data.userPhone,
      email: data.email,
      roleId: data.userType,
      password: data.password
    }
  })
}

/** 删除用户 */
export function fetchDeleteUser(id: number) {
  return api.del<any>({
    url: `/api/system/user/delete/${id}`
  })
}
