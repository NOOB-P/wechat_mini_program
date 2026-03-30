import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const courseStudyRoutes: AppRouteRecord = {
  path: '/course-study',
  component: RoutesAlias.Layout,
  name: 'CourseStudy',
  meta: {
    title: '课程与自习室',
    icon: 'ri:book-open-line',
    sort: 2
  },
  children: [
    {
      path: 'course',
      name: 'CourseManage',
      component: '/course-study/course',
      meta: {
        title: '公益课程管理'
      }
    },
    {
      path: 'svip-course',
      name: 'SvipCourseManage',
      component: '/course-study/svip-course',
      meta: {
        title: 'SVIP 课程管理'
      }
    },
    {
      path: 'study-room',
      name: 'StudyRoomManage',
      component: '/course-study/study-room',
      meta: {
        title: 'AI 自习室报名'
      }
    }
  ]
}
