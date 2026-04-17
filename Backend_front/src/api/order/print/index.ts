import api from '@/utils/http'

/**
 * 获取打印订单列表
 * @param params 查询参数
 */
export function fetchPrintOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/print/list',
    params
  })
}

/**
 * 导出打印订单
 * @param params 查询参数
 */
export function exportPrintOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/print/export',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取打印订单详情
 * @param id 订单ID
 */
export function fetchPrintOrderDetail(id: number | string) {
  return api.get<any>({
    url: `/api/admin/order/print/${id}`
  })
}

/**
 * 更新打印订单状态
 * @param id 订单ID
 * @param status 状态值
 */
export function updatePrintOrderStatus(id: number | string, status: number) {
  return api.put<any>({
    url: `/api/admin/order/print/${id}/status`,
    data: { status }
  })
}
