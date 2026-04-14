import api from '@/utils/http'

export function fetchAnalysisClassSelect(projectId: string) {
  return api.get<any>({
    url: '/api/system/exam-analysis/class-select',
    params: { projectId }
  })
}
