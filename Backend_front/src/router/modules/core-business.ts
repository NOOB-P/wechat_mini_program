import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const coreBusinessRoutes: AppRouteRecord = {
  path: '/core-business',
  component: RoutesAlias.Layout,
  name: 'CoreBusiness',
  redirect: '/core-business/school',
  meta: {
    title: '学校档案管理',
    icon: 'ri:database-2-line',
    sort: 1
  },
  children: [
    {
      path: 'school',
      name: 'SchoolOrg',
      component: '/core-business/school',
      meta: {
        title: '学校数据',
        isHide: true,
        authMark: 'system:school:list'
      }
    },
    {
      path: 'sys-class',
      name: 'SysClass',
      component: '/core-business/sys-class',
      meta: {
        title: '班级数据',
        isHide: true,
        authMark: 'system:class:list'
      }
    },
    {
      path: 'student',
      name: 'StudentProfile',
      component: '/core-business/student',
      meta: {
        title: '学生数据',
        isHide: true,
        authMark: 'system:student:list'
      }
    }
  ]
}
