import api from '@/utils/http'

export interface ExamSubjectItem {
  id: string
  projectId: string
  subjectName: string
  paperUrl?: string | null
  answerUrl?: string | null
  paperMergeInfo?: string | null
  answerMergeInfo?: string | null
  paperLayouts?: string | null
  answersLayouts?: string | null
  scoreUploaded?: boolean
}

export function fetchExamSubjectList(projectId: string) {
  return api.get<{
    records: ExamSubjectItem[]
    total: number
  }>({
    url: '/api/system/exam-subject/list',
    params: { projectId }
  })
}

export function fetchAddExamSubject(data: { projectId: string; subjectName: string }) {
  return api.post<void>({
    url: '/api/system/exam-subject/add',
    data
  })
}

export function fetchDeleteExamSubject(id: string) {
  return api.del<void>({
    url: `/api/system/exam-subject/delete/${id}`
  })
}

export function fetchUploadExamSubjectFile(params: {
  subjectId: string
  type: 'paper' | 'answer'
  file: File
}) {
  const formData = new FormData()
  formData.append('subjectId', params.subjectId)
  formData.append('type', params.type)
  formData.append('file', params.file)
  return api.post<string>({
    url: '/api/system/exam-subject/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
