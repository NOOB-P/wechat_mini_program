import api from '@/utils/http'

export function fetchAnalysisProjects(params?: { name?: string }) {
  return api.get<{
    records: Array<{
      id: string
      name: string
      createTime: string
      schoolCount: number
      classCount: number
      studentCount: number
    }>
    total: number
  }>({
    url: '/api/system/exam-analysis/projects',
    params
  })
}
