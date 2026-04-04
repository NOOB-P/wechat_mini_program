import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const examRoutes: AppRouteRecord = {
  path: '/exam-hub',
  component: RoutesAlias.Layout,
  name: 'ExamHub',
  redirect: '/exam-hub/project',
  meta: {
    title: '考试数据中心',
    icon: 'ri:line-chart-line',
    sort: 2
  },
  children: [
    {
      path: 'project',
      name: 'ExamProject',
      component: '/core-business/exam/project',
      meta: {
        title: '考试项目管理'
      }
    },
    {
      path: 'analysis-list',
      name: 'ExamAnalysisList',
      component: '/core-business/exam/analysis/list',
      meta: {
        title: '考试数据分析'
      }
    },
    {
      path: 'analysis-dashboard',
      name: 'ExamAnalysisDashboard',
      component: '/core-business/exam/analysis/dashboard',
      meta: {
        title: '分析大屏',
        isHide: true
      }
    },
    {
      path: 'class',
      name: 'ExamClass',
      component: '/core-business/exam/class',
      meta: {
        title: '考试班级管理',
        isHide: true
      }
    },
    {
      path: 'subject',
      name: 'ExamSubject',
      component: '/core-business/exam/subject',
      meta: {
        title: '考试科目管理',
        isHide: true
      }
    }
  ]
}
