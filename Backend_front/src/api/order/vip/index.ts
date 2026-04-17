import api from '@/utils/http'

/**
 * 获取 VIP 订单列表
 * @param params 查询参数
 */
export async function fetchVipOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/vip/list',
    params
  })
}

/**
 * 导出 VIP 订单
 * @param params 查询参数
 */
export async function exportVipOrderList(params?: any) {
  return api.get<any>({
    url: '/api/admin/order/vip/export',
    params,
    responseType: 'blob'
  })
}
