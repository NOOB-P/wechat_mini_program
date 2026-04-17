import api from '@/utils/http'

export function fetchAnalysisStudentSubjectReport(params: {
  projectId: string
  classId: string
  studentNo: string
  subjectName: string
}) {
  return api.get<any>({
    url: '/api/system/exam-analysis/student-subject-report',
    params
  })
}
