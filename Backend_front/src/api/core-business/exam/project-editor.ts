import api from '@/utils/http'

export interface ProjectStudentItem {
  id: string
  studentNo: string
  studentName: string
  schoolId: string
  school: string
  grade: string
  classId: string
  className: string
  completedSubjectCount: number
  subjectCount: number
  status: string
}

export interface ProjectScoreSummaryItem {
  subjectName: string
  paperCount: number
  classCount: number
  studentCount: number
  scoreCount: number
  avgScore: number | null
  maxScore: number | null
  minScore: number | null
  paperUploaded: boolean
  scoreUploaded: boolean
}

export interface ProjectScoreItem {
  id: number | null
  subjectName: string
  studentNo: string
  studentName: string
  schoolId: string
  school: string
  grade: string
  classId: string
  className: string
  hasAnswerSheet: boolean
  answerSheetUrl?: string | null
  hasScore: boolean
  totalScore: number | null
  updateTime?: string | number[] | null
}

export function fetchProjectStudents(params: {
  projectId: string
  current?: number
  size?: number
  keyword?: string
  schoolId?: string
  classId?: string
}) {
  return api.get<{
    records: ProjectStudentItem[]
    total: number
    current: number
    size: number
    pages: number
    stats: Record<string, number>
  }>({
    url: '/api/system/exam-project/students',
    params
  })
}

export function fetchProjectScoreSummary(projectId: string) {
  return api.get<{
    records: ProjectScoreSummaryItem[]
    stats: Record<string, number>
  }>({
    url: '/api/system/exam-project/scores/summary',
    params: { projectId }
  })
}

export function fetchProjectScoreList(params: {
  projectId: string
  subjectName?: string
  current?: number
  size?: number
  keyword?: string
  schoolId?: string
  classId?: string
}) {
  return api.get<{
    records: ProjectScoreItem[]
    total: number
    current: number
    size: number
    pages: number
  }>({
    url: '/api/system/exam-project/scores/list',
    params
  })
}

/**
 * 下载成绩导入模板
 */
export function fetchDownloadScoreTemplate() {
  return api.get<any>({
    url: '/api/system/exam-project/scores/template',
    responseType: 'blob'
  })
}

/**
 * 导入成绩
 */
export function fetchImportScore(params: {
  projectId: string
  subjectName: string
  file: File
}) {
  const formData = new FormData()
  formData.append('projectId', params.projectId)
  formData.append('subjectName', params.subjectName)
  formData.append('file', params.file)
  return api.post<void>({
    url: '/api/system/exam-project/scores/import',
    data: formData,
    showSuccessMessage: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function fetchImportAnswerSheetZip(params: {
  projectId: string
  subjectName: string
  file: File
}) {
  const formData = new FormData()
  formData.append('projectId', params.projectId)
  formData.append('subjectName', params.subjectName)
  formData.append('file', params.file)
  return api.post<void>({
    url: '/api/system/exam-project/papers/import',
    data: formData,
    showSuccessMessage: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function fetchUploadStudentAnswerSheet(params: {
  projectId: string
  subjectName: string
  studentNo: string
  file: File
}) {
  const formData = new FormData()
  formData.append('projectId', params.projectId)
  formData.append('subjectName', params.subjectName)
  formData.append('studentNo', params.studentNo)
  formData.append('file', params.file)
  return api.post<string>({
    url: '/api/system/exam-project/papers/upload',
    data: formData,
    showSuccessMessage: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
