import api from '@/utils/http'

export function fetchAnalysisClassDashboard(params: { projectId: string; classId: string }) {
  return api.get<any>({
    url: '/api/system/exam-analysis/class-dashboard',
    params
  })
}
