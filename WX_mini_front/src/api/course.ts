import request from '@/utils/request'

/**
 * 获取常规课程列表
 */
export const getCourseListApi = () => {
  return request({ url: '/api/app/course/list', method: 'GET' })
}

/**
 * 获取课程详情
 * @param id 课程ID
 */
export const getCourseDetailApi = (id: string) => {
  return request({ url: '/api/app/course/detail', method: 'GET', data: { id } })
}

/**
 * 收藏/取消收藏课程
 */
export const collectCourseApi = (data: { courseId: string, isCollect: boolean }) => {
  return request({ url: '/api/app/course/collect', method: 'POST', data })
}

/**
 * 记录学习进度
 */
export const recordLearningApi = (data: { courseId: string, progress: number }) => {
  return request({ url: '/api/app/course/learn', method: 'POST', data })
}

/**
 * 获取我的课程 (最近查看)
 */
export const getMyCoursesApi = () => {
  return request({ url: '/api/app/mine/course/list', method: 'GET' })
}

/**
 * 获取我的收藏
 */
export const getMyCollectionsApi = () => {
  return request({ url: '/api/app/mine/collection/list', method: 'GET' })
}

/**
 * 获取学习记录
 */
export const getMyStudyRecordsApi = () => {
  return request({ url: '/api/app/mine/record/list', method: 'GET' })
}
