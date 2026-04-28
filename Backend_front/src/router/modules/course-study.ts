import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const courseStudyRoutes: AppRouteRecord = {
  path: '/course-study',
  component: RoutesAlias.Layout,
  name: 'CourseStudy',
  redirect: '/course-study/course',
  meta: {
    title: '课程管理',
    icon: 'ri:book-open-line',
    sort: 4
  },
  children: [
    {
      path: 'course',
      name: 'CourseManage',
      component: '/course-study/course',
      meta: {
        title: '课程管理',
        isHide: true,
        activePath: '/course-study',
        authMark: 'course:manage:list'
      }
    }
    // {
    //   path: 'study-room',
    //   name: 'StudyRoomManage',
    //   component: '/course-study/study-room',
    //   meta: {
    //     title: 'AI 自习室报名',
    //     authMark: 'course:manage:list'
    //   }
    // }
  ]
}
