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
export function fetchAddRole(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '新增成功',
    data: null
  })
}

/** 更新角色 */
export function fetchUpdateRole(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

/** 删除角色 */
export function fetchDeleteRole(id: number) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}

/** 分配权限 */
export function fetchAssignPermissions(roleId: number, menuIds: number[]) {
  return Promise.resolve({
    code: 200,
    msg: '分配成功',
    data: null
  })
}
