import { mockAnalysisData } from '@/mock/dashboard/analysis'

/**
 * 获取仪表盘分析数据
 * @returns 仪表盘分析数据
 */
export function fetchGetDashboardAnalysis() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockAnalysisData
  })
}
