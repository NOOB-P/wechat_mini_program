import request from '@/utils/request'

export const getVipOptionsApi = () => {
  return request({
    url: '/api/vip/options',
    method: 'GET'
  })
}

export const getVipRechargeConfigApi = () => {
  return request({
    url: '/api/app/vip/config',
    method: 'GET'
  })
}

export const getVipAnalysisDataApi = () => {
  return request({
    url: '/api/app/vip/analysis',
    method: 'GET'
  })
}

export const getVipWrongBookApi = (params: any) => {
  return request({
    url: '/api/app/vip/wrongbook/list',
    method: 'GET',
    params
  })
}

export const submitPrintOrderApi = (data: any) => {
  return request({
    url: '/api/app/vip/print/order',
    method: 'POST',
    data
  })
}

export const getPrintConfigApi = () => {
  return request({
    url: '/api/app/vip/print/config',
    method: 'GET'
  })
}

export const createVipOrderApi = (data: any) => {
  return request({ url: '/api/app/vip/order/create', method: 'POST', data })
}

export const cancelVipOrderApi = (orderNo: string) => {
  return request({ url: '/api/app/vip/order/cancel', method: 'POST', data: { orderNo } })
}

export const createVipPayApi = (orderNo: string) => {
  return request({
    url: '/api/app/vip/order/pay',
    method: 'POST',
    data: { orderNo }
  })
}

export const confirmVipVirtualPayApi = (orderNo: string, security: Record<string, any>) => {
  return request({
    url: '/api/app/vip/order/pay/confirm',
    method: 'POST',
    data: { orderNo, security }
  })
}

export const simulatePayCallbackApi = (orderNo: string) => {
  return request({
    url: '/api/app/vip/order/callback',
    method: 'POST',
    data: { orderNo }
  })
}

export const isVipExpired = (userInfo: any): boolean => {
  if (!userInfo || !userInfo.vipExpireTime) return false

  const expireTime = new Date(userInfo.vipExpireTime).getTime()
  const now = new Date().getTime()
  return now > expireTime
}
