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
  classCount: number
  studentCount: number
  scoreCount: number
  avgScore: number | null
  maxScore: number | null
  minScore: number | null
  scoreUploaded: boolean
}

export interface ProjectScoreItem {
  id: number
  subjectName: string
  studentNo: string
  studentName: string
  schoolId: string
  school: string
  grade: string
  classId: string
  className: string
  totalScore: number
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
