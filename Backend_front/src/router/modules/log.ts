import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const logRoutes: AppRouteRecord = {
  path: '/log',
  name: 'LogRoot',
  component: RoutesAlias.Layout,
  meta: {
    title: '日志管理',
    icon: 'ri:file-list-2-line',
    sort: 6
  },
  children: [
    {
      path: '',
      name: 'Log',
      component: '/log',
      meta: {
        title: '日志管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authMark: 'system:log:list'
      }
    }
  ]
}
