import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const paperRoutes: AppRouteRecord = {
  path: '/paper-manage',
  component: RoutesAlias.Layout,
  name: 'PaperManageRoot',
  redirect: '/paper-manage/index',
  meta: {
    title: '试卷管理',
    icon: 'ri:file-paper-2-line',
    sort: 3
  },
  children: [
    {
      path: 'index',
      name: 'PaperManage',
      component: '/course-study/paper',
      meta: {
        title: '试卷管理',
        isHide: true,
        activePath: '/paper-manage',
        authMark: 'paper:manage:list'
      }
    }
  ]
}
