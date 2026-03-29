import { mockPrintConfig } from '@/mock/payment/print'

/**
 * 获取打印价格配置
 */
export async function fetchPrintConfig() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockPrintConfig
  })
}

/**
 * 更新打印价格设置
 * @param params 配置参数
 */
export async function updatePrintConfig(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '配置更新成功',
    data: null
  })
}

/**
 * 更新配送费用设置
 * @param params 配送参数
 */
export async function updateDeliveryConfig(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '配送费用更新成功',
    data: null
  })
}
