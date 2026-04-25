import request from '@/utils/request'

/**
 * 获取我的打印记录
 */
export const getMyPrintOrdersApi = () => {
  return request({ url: '/api/app/order/print/list', method: 'GET' })
}

export const createPrintPayApi = (orderNo: string) => {
  return request({ url: '/api/app/order/print/pay', method: 'POST', data: { orderNo } })
}

export const confirmPrintVirtualPayApi = (orderNo: string, security: Record<string, any>) => {
  return request({ url: '/api/app/order/print/pay/confirm', method: 'POST', data: { orderNo, security } })
}

/**
 * 获取已购课程
 */
export const getPurchasedCoursesApi = () => {
  return request({ url: '/api/app/course/purchased', method: 'GET' })
}

/**
 * 获取我的 VIP 充值记录
 */
export const getMyVipOrdersApi = () => {
  return request({ url: '/api/app/vip/orders', method: 'GET' })
}
