import api from '@/utils/http'

export type ExamType = 'NORMAL' | 'JOINT'

export interface ExamProjectForm {
  id?: string
  name: string
  examType?: ExamType
  schoolIds: string[]
  classIds: string[]
  subjects: string[]
}

export interface ExamProjectItem {
  id: string
  name: string
  examType?: ExamType
  examTypeLabel?: string
  schoolCount: number
  classCount: number
  studentCount: number
  subjectCount: number
  subjects: string[]
  createTime?: string | number[] | null
  updateTime?: string | number[] | null
}

export interface ProjectSchoolOption {
  id: string
  name: string
  province?: string
  city?: string
  classCount: number
  studentCount: number
  label: string
}

export interface ProjectClassOption {
  id: string
  schoolId: string
  schoolName: string
  grade: string
  className: string
  studentCount: number
  label: string
}

export interface ExamProjectDetailData {
  project: ExamProjectItem & {
    selectedSchoolIds: string[]
    selectedClassIds: string[]
  }
  stats: Record<string, number>
  classes: Array<{
    id: string
    projectId: string
    schoolId: string
    school: string
    grade: string
    className: string
    sourceClassId: string
    studentCount: number
  }>
  subjects: Array<{
    subjectName: string
    classCount: number
    studentCount: number
    scoreCount?: number
    avgScore?: number | null
    maxScore?: number | null
    minScore?: number | null
    scoreUploaded?: boolean
  }>
  schools: Array<{
    schoolId: string
    schoolName: string
    classCount: number
    studentCount: number
  }>
}

export function fetchGetProjectList(params: { current?: number; size?: number; name?: string }) {
  return api.get<{
    records: ExamProjectItem[]
    total: number
    current: number
    size: number
    pages: number
  }>({
    url: '/api/system/exam-project/list',
    params
  })
}

export function fetchProjectOptions() {
  return api.get<{
    schools: ProjectSchoolOption[]
    classes: ProjectClassOption[]
    subjects: string[]
  }>({
    url: '/api/system/exam-project/options'
  })
}

export function fetchProjectDetail(id: string) {
  return api.get<ExamProjectDetailData>({
    url: `/api/system/exam-project/detail/${id}`
  })
}

export function fetchAddProject(data: ExamProjectForm) {
  return api.post<void>({
    url: '/api/system/exam-project/add',
    data
  })
}

export function fetchUpdateProject(data: ExamProjectForm) {
  return api.put<void>({
    url: '/api/system/exam-project/edit',
    data
  })
}

export function fetchDeleteProject(id: string) {
  return api.del<void>({
    url: `/api/system/exam-project/delete/${id}`
  })
}
