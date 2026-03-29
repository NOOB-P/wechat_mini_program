import { mockVipOrders } from '@/mock/order/vip'

/**
 * 获取 VIP 订单列表
 * @param params 查询参数
 */
export async function fetchVipOrderList(params?: any) {
  const { current = 1, size = 10, userName, orderNo, paymentStatus } = params || {}
  
  let filteredList = [...mockVipOrders]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (orderNo) {
    filteredList = filteredList.filter(item => item.orderNo.includes(orderNo))
  }
  if (paymentStatus !== undefined && paymentStatus !== '') {
    filteredList = filteredList.filter(item => item.paymentStatus === parseInt(paymentStatus))
  }

  const total = filteredList.length
  const start = (current - 1) * size
  const end = start + size
  const records = filteredList.slice(start, end)

  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      records,
      total,
      current,
      size
    }
  })
}
