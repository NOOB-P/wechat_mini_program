import { mockPrintOrders } from '@/mock/order/print'

/**
 * 获取打印订单列表
 * @param params 查询参数
 */
export async function fetchPrintOrderList(params?: any) {
  const { current = 1, size = 10, userName, orderNo, orderStatus } = params || {}
  
  let filteredList = [...mockPrintOrders]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (orderNo) {
    filteredList = filteredList.filter(item => item.orderNo.includes(orderNo))
  }
  if (orderStatus !== undefined && orderStatus !== '') {
    filteredList = filteredList.filter(item => item.orderStatus === parseInt(orderStatus))
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
