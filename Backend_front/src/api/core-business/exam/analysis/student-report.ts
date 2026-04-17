import api from '@/utils/http'

export function fetchAnalysisStudentReport(params: {
  projectId: string
  classId: string
  studentNo: string
}) {
  return api.get<any>({
    url: '/api/system/exam-analysis/student-report',
    params
  })
}
