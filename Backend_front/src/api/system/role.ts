import { mockRoleList } from '@/mock/system/role'

/** 获取角色列表 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      records: mockRoleList,
      total: mockRoleList.length,
      current: params.current || 1,
      size: params.size || 10
    }
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
