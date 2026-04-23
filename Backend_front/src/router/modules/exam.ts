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
        title: '考试项目管理',
        authMark: 'exam:project:list'
      }
    },
    {
      path: 'project-editor',
      name: 'ExamProjectEditor',
      component: '/core-business/exam/project-editor',
      meta: {
        title: '考试项目编辑',
        isHide: true,
        activePath: '/exam-hub/project'
      }
    },
    {
      path: 'analysis-list',
      name: 'ExamAnalysisList',
      component: '/core-business/exam/analysis/list',
      meta: {
        title: '考试数据分析',
        authMark: 'exam:project:list'
      }
    },
    {
      path: 'analysis-dashboard',
      name: 'ExamAnalysisDashboard',
      component: '/core-business/exam/analysis/dashboard',
      meta: {
        title: '分析大屏',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'analysis-class-select',
      name: 'ExamAnalysisClassSelect',
      component: '/core-business/exam/analysis/class-select',
      meta: {
        title: '选择分析班级',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'analysis-class-dashboard',
      name: 'ExamAnalysisClassDashboard',
      component: '/core-business/exam/analysis/class-dashboard',
      meta: {
        title: '班级分析大屏',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'analysis-subject-report',
      name: 'ExamAnalysisSubjectReport',
      component: '/core-business/exam/analysis/subject-report',
      meta: {
        title: '单科报表',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'analysis-student-report',
      name: 'ExamAnalysisStudentReport',
      component: '/core-business/exam/analysis/student-report',
      meta: {
        title: '学生分析报告',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'analysis-student-subject-report',
      name: 'ExamAnalysisStudentSubjectReport',
      component: '/core-business/exam/analysis/student-subject-report',
      meta: {
        title: '学生单科分析',
        isHide: true,
        activePath: '/exam-hub/analysis-list'
      }
    },
    {
      path: 'class',
      name: 'ExamClass',
      component: '/core-business/exam/class',
      meta: {
        title: '考试班级管理',
        isHide: true,
        activePath: '/exam-hub/project'
      }
    },
    {
      path: 'subject',
      name: 'ExamSubject',
      component: '/core-business/exam/subject',
      meta: {
        title: '考试科目管理',
        isHide: true,
        activePath: '/exam-hub/project'
      }
    },
    {
      path: 'subject-score',
      name: 'ExamSubjectScore',
      component: '/core-business/exam/subject-score',
      meta: {
        title: '科目成绩管理',
        isHide: true,
        activePath: '/exam-hub/project'
      }
    }
  ]
}
