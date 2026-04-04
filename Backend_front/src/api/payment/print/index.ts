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
 * 保存单个配送配置 (新增或修改)
 * @param params 配送配置对象
 */
export function saveDeliveryConfig(params: any) {
  return api.post<any>({
    url: '/api/admin/payment/print/delivery-config',
    data: params
  })
}

/**
 * 删除配送配置
 * @param id 配置ID
 */
export function deleteDeliveryConfig(id: number | string) {
  return api.del<any>({
    url: `/api/admin/payment/print/delivery-config/${id}`
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
