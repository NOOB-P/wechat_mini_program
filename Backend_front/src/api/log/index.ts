import api from '@/utils/http'
import { mockLogList } from '@/mock/log/log'

/**
 * 获取日志列表
 * @param params 查询参数
 */
export async function fetchLogList(params?: any) {
  return api.get<any>({
    url: '/api/log/list',
    params
  })
}

/**
 * 删除日志
 * @param ids 日志 ID 列表
 */
export async function deleteLogs(ids: number[]) {
  // TODO: 后续可以接入真实的删除接口
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
  // TODO: 后续可以接入真实的导出接口
  return Promise.resolve({
    code: 200,
    msg: '导出成功，正在生成文件...',
    data: null
  })
}
