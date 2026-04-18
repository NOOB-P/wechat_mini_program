import api from '@/utils/http'

/** 获取角色列表 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return api.get<any>({
    url: '/api/system/role/list',
    params
  })
}

/** 获取角色选项列表 (排除学生) */
export function fetchGetRoleOptions() {
  return api.get<any>({
    url: '/api/system/role/options'
  })
}
/** 新增角色 */
export function fetchAddRole(data: any) {
  return api.post<any>({
    url: '/api/system/role/save',
    data
  })
}

/** 更新角色 */
export function fetchUpdateRole(id: number, data: any) {
  return api.put<any>({
    url: `/api/system/role/edit/${id}`,
    data
  })
}

/** 删除角色 */
export function fetchDeleteRole(id: number) {
  return api.del<any>({
    url: `/api/system/role/${id}`
  })
}

/** 获取角色的权限标识列表 */
export function fetchGetRolePermissions(roleId: number) {
  return api.get<string[]>({
    url: `/api/system/role/permissions/${roleId}`
  })
}

/** 分配权限 */
export function fetchAssignPermissions(roleId: number, permissionCodes: string[]) {
  return api.post<any>({
    url: `/api/system/role/permissions/${roleId}`,
    data: permissionCodes
  })
}
