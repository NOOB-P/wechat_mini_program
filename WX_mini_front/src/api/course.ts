import request from '@/utils/request'

export const getCourseListApi = (params?: any) => {
  return request({ url: '/api/app/course/list', method: 'GET', data: params })
}

export const getCourseDetailApi = (id: string) => {
  return request({ url: '/api/app/course/detail', method: 'GET', data: { id } })
}

export const collectCourseApi = (data: { courseId: string; isCollect: boolean }) => {
  return request({ url: '/api/app/course/collect', method: 'POST', data })
}

export const recordLearningApi = (data: { courseId: string; progress: number }) => {
  return request({ url: '/api/app/course/learn', method: 'POST', data })
}

export const getMyCoursesApi = () => {
  return request({ url: '/api/app/mine/course/list', method: 'GET' })
}

export const getMyCollectionsApi = () => {
  return request({ url: '/api/app/mine/collection/list', method: 'GET' })
}

export const getMyStudyRecordsApi = () => {
  return request({ url: '/api/app/mine/record/list', method: 'GET' })
}

export const getPurchasedCoursesApi = () => {
  return request({ url: '/api/app/course/purchased', method: 'GET' })
}

export const buyCourseApi = (courseId: string) => {
  return request({ url: '/api/app/course/buy', method: 'POST', data: { courseId } })
}

export const createCoursePayApi = (orderNo: string) => {
  return request({ url: '/api/app/course/pay', method: 'POST', data: { orderNo } })
}

export const confirmCourseVirtualPayApi = (orderNo: string, security: Record<string, any>) => {
  return request({ url: '/api/app/course/pay/confirm', method: 'POST', data: { orderNo, security } })
}

export const payMockApi = (orderNo: string) => {
  return request({ url: '/api/app/course/pay-mock', method: 'POST', data: { orderNo } })
}
