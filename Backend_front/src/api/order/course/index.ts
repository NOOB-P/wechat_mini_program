import api from '@/utils/http'

/**
 * 获取课程订单列表
 * @param params 查询参数
 */
export async function fetchCourseOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/course/list',
    params
  })
}

/**
 * 导出课程订单
 * @param params 查询参数
 */
export async function exportCourseOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/course/export',
    params,
    responseType: 'blob'
  })
}
