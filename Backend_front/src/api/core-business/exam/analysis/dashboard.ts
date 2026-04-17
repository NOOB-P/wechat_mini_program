import api from '@/utils/http'

export function fetchAnalysisProjectDashboard(projectId: string) {
  return api.get<any>({
    url: '/api/system/exam-analysis/project-dashboard',
    params: { projectId }
  })
}
