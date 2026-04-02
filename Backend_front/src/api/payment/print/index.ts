import api from '@/utils/http'

/**
 * 获取打印价格配置
 */
export function fetchPrintConfig() {
  return api.get<any>({
    url: '/api/admin/payment/print/config'
  })
}

/**
 * 更新纸张价格设置
 * @param params 纸张配置数组
 */
export function updatePaperPrices(params: any[]) {
  return api.put<any>({
    url: '/api/admin/payment/print/paper-prices',
    data: params
  })
}

/**
 * 更新配送费用设置
 * @param params 配送参数数组
 */
export function updateDeliveryConfig(params: any[]) {
  return api.put<any>({
    url: '/api/admin/payment/print/delivery-configs',
    data: params
  })
}
