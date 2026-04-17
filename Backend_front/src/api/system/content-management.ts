import api from '@/utils/http'

export async function fetchGetPermissionOptions() {
  return api.get<Api.ContentManage.PermissionOption[]>({
    url: '/api/admin/content-management/options'
  })
}

export async function fetchGetRolePermissions(params: Api.ContentManage.PermissionSearchParams) {
  return api.get<Api.Common.PaginatedResponse<Api.ContentManage.RolePermissionItem>>({
    url: '/api/admin/content-management/roles',
    params
  })
}

export async function fetchUpdateRolePermissions(roleId: number, permissionCodes: string[]) {
  return api.post({
    url: '/api/admin/content-management/save',
    data: {
      roleId,
      permissionCodes
    }
  })
}
