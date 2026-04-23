import api from '@/utils/http'

export function fetchAnalysisSubjectReport(params: { projectId: string; subjectName?: string }) {
  return api.get<any>({
    url: '/api/system/exam-analysis/subject-report',
    params
  })
}
