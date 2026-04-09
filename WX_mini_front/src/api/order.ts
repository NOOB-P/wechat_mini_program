import request from '@/utils/request'

/**
 * 获取我的打印记录
 */
export const getMyPrintOrdersApi = () => {
  return request({ url: '/api/app/order/print/list', method: 'GET' })
}

/**
 * 获取已购课程
 */
export const getPurchasedCoursesApi = () => {
  return request({ url: '/api/app/course/purchased', method: 'GET' })
}
