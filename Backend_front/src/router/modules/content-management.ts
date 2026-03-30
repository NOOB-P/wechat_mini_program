import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const contentManagementRoutes: AppRouteRecord = {
  path: '/content-management',
  component: RoutesAlias.Layout,
  name: 'ContentManagementRoot',
  meta: {
    title: '内容分配管理',
    icon: 'ri:user-settings-line',
    sort: 1, // 设置排序，使其靠近仪表盘
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'index',
      name: 'ContentManagement',
      component: '/content-management/index',
      meta: {
        title: '模块管理分配',
        keepAlive: true,
        fixedTab: false
      }
    }
  ]
}
