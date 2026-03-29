import request from '@/utils/request'

/**
 * @Description: 获取 VIP 数据分析数据
 */
export const getVipAnalysisDataApi = () => {
  return request({
    url: '/vip/analysis',
    method: 'GET'
  })
}

/**
 * @Description: 获取 VIP 错题本列表
 * @param {object} params 查询参数 (subject, timeRange)
 */
export const getVipWrongBookApi = (params: any) => {
  return request({
    url: '/vip/wrongbook/list',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 提交错题纸质打印订单
 */
export const submitPrintOrderApi = (data: any) => {
  return request({
    url: '/vip/print/order',
    method: 'POST',
    data
  })
}

/**
 * @Description: 获取打印配置
 */
export const getPrintConfigApi = () => {
  return request({
    url: '/vip/print/config',
    method: 'GET'
  })
}
