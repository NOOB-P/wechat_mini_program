import { mockLogList } from '@/mock/log/log'

/**
 * 获取日志列表
 * @param params 查询参数
 */
export async function fetchLogList(params?: any) {
  const { current = 1, size = 10, userName, operation, status } = params || {}
  
  // 模拟搜索过滤
  let filteredList = [...mockLogList]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (operation) {
    filteredList = filteredList.filter(item => item.operation.includes(operation))
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === parseInt(status))
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

/**
 * 删除日志
 * @param ids 日志 ID 列表
 */
export async function deleteLogs(ids: number[]) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}

/**
 * 导出日志
 * @param params 查询参数
 */
export async function exportLogs(params?: any) {
  return Promise.resolve({
    code: 200,
    msg: '导出成功，正在生成文件...',
    data: null
  })
}
