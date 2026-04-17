import { RoutesAlias } from '../routesAlias';
export const courseStudyRoutes = {
    path: '/course-study',
    component: RoutesAlias.Layout,
    name: 'CourseStudy',
    meta: {
        title: '课程与自习室',
        icon: 'ri:book-open-line',
        sort: 4
    },
    children: [
        {
            path: 'course',
            name: 'CourseManage',
            component: '/course-study/course',
            meta: {
                title: '公益课程管理',
                authMark: 'course:manage:list'
            }
        },
        {
            path: 'svip-course',
            name: 'SvipCourseManage',
            component: '/course-study/svip-course',
            meta: {
                title: 'SVIP 课程管理',
                authMark: 'course:manage:list'
            }
        },
        {
            path: 'study-room',
            name: 'StudyRoomManage',
            component: '/course-study/study-room',
            meta: {
                title: 'AI 自习室报名',
                authMark: 'course:manage:list'
            }
        }
    ]
};
//# sourceMappingURL=course-study.js.map