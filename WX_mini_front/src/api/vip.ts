import request from '@/utils/request'

/**
 * @Description: 获取已启用的会员配置和价格
 */
export const getVipOptionsApi = () => {
  return request({
    url: '/api/vip/options',
    method: 'GET'
  })
}

/**
 * @Description: 获取 VIP 数据分析数据
 */
export const getVipAnalysisDataApi = () => {
  return request({
    url: '/api/app/vip/analysis',
    method: 'GET'
  })
}

/**
 * @Description: 获取 VIP 错题本列表
 * @param {object} params 查询参数 (subject, timeRange)
 */
export const getVipWrongBookApi = (params: any) => {
  return request({
    url: '/api/app/vip/wrongbook/list',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 提交错题纸质打印订单
 */
export const submitPrintOrderApi = (data: any) => {
  return request({
    url: '/api/app/vip/print/order',
    method: 'POST',
    data
  })
}

/**
 * @Description: 获取打印配置
 */
export const getPrintConfigApi = () => {
  return request({
    url: '/api/app/vip/print/config',
    method: 'GET'
  })
}

/**
 * @Description: 创建 VIP 订单
 */
export const createVipOrderApi = (data: any) => {
  return request({
    url: '/api/app/vip/order/create',
    method: 'POST',
    data
  })
}

/**
 * @Description: 模拟支付回调
 */
export const simulatePayCallbackApi = (orderNo: string) => {
  return request({
    url: '/api/app/vip/order/callback',
    method: 'POST',
    data: { orderNo }
  })
}
