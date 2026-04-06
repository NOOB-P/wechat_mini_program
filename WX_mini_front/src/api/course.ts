import request from '@/utils/request'

/**
 * 获取常规课程列表
 */
export const getCourseListApi = (params?: any) => {
  return request({ url: '/api/app/course/list', method: 'GET', data: params })
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

/**
 * 获取已购课程
 */
export const getPurchasedCoursesApi = () => {
  return request({ url: '/api/app/course/purchased', method: 'GET' })
}

/**
 * 创建课程订单
 */
export const buyCourseApi = (courseId: string) => {
  return request({ url: '/api/app/course/buy', method: 'POST', data: { courseId } })
}

/**
 * 模拟支付
 */
export const payMockApi = (orderNo: string) => {
  return request({ url: '/api/app/course/pay-mock', method: 'POST', data: { orderNo } })
}
