import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const coreBusinessRoutes: AppRouteRecord = {
  path: '/core-business',
  component: RoutesAlias.Layout,
  name: 'CoreBusiness',
  meta: {
    title: '核心业务',
    icon: 'ri:database-2-line',
    sort: 1
  },
  children: [
    {
      path: 'school',
      name: 'SchoolOrg',
      component: '/core-business/school',
      meta: {
        title: '学校架构管理'
      }
    },
    {
      path: 'student',
      name: 'StudentProfile',
      component: '/core-business/student',
      meta: {
        title: '学生档案管理'
      }
    },
    {
      path: 'exam',
      name: 'ExamDataHub',
      component: '/core-business/exam',
      meta: {
        title: '考试数据中心'
      }
    },
    {
      path: 'exam/analysis-res',
      name: 'ExamAnalysisRes',
      component: '/core-business/exam/analysis-res',
      meta: {
        title: '解析结果',
        isHide: true // 隐藏在菜单中
      }
    }
  ]
}
