import api from '@/utils/http'

/**
 * 获取仪表盘分析数据
 * @returns 仪表盘分析数据
 */
export function fetchGetDashboardAnalysis() {
  return api.get<any>({
    url: '/api/admin/dashboard/analysis'
  })
}
