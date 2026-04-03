import api from '@/utils/http'

/**
 * 获取所有可配置的模块列表
 */
export async function fetchGetAllModules() {
  // 保持前端定义，因为路由是前端定义的
  const allModules = [
    { title: '仪表盘', path: '/dashboard', icon: 'ri:pie-chart-line' },
    { title: '核心业务', path: '/core-business', icon: 'ri:briefcase-line' },
    { title: '订单管理', path: '/order', icon: 'ri:article-line' },
    { title: '课程与自习室', path: '/course-study', icon: 'ri:book-open-line' },
    { title: '付费管理', path: '/payment', icon: 'ri:bank-card-line' },
    { title: '客服与互动', path: '/support-interaction', icon: 'ri:customer-service-2-line' },
    { title: '系统管理', path: '/system', icon: 'ri:settings-4-line' },
    { title: '日志管理', path: '/log', icon: 'ri:history-line' }
  ]
  
  return allModules
}

/**
 * 获取用户权限列表 (仅限 admin 角色)
 */
export async function fetchGetUserPermissions(params: Api.ContentManage.PermissionSearchParams) {
  return api.get<Api.Common.PaginatedResponse<Api.ContentManage.UserModulePermission>>({
    url: '/api/admin/content-management/users',
    params
  })
}

/**
 * 更新用户权限
 */
export async function fetchUpdateUserPermissions(uid: number, allowedModules: string[]) {
  return api.post({
    url: '/api/admin/content-management/save',
    data: {
      uid,
      allowedModules
    }
  })
}
