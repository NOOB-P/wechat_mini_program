import api from '@/utils/http'
import { normalizeQuestionNo } from '@/utils/exam-utils'

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

export interface PaperRegionItem {
  id: string
  questionNo: string
  questionType: string
  knowledgePoint: string
  score: number | null
  remark: string
  sortOrder: number
  x: number
  y: number
  width: number
  height: number
}

export function normalizePaperRegion(
  region: Partial<PaperRegionItem> | undefined,
  index: number
): PaperRegionItem {
  const sortOrder = Number(region?.sortOrder ?? index + 1) || index + 1
  return {
    id: String(region?.id || ''),
    questionNo: normalizeQuestionNo(region?.questionNo, sortOrder),
    questionType: String(region?.questionType || '').trim(),
    knowledgePoint: String(region?.knowledgePoint || '').trim(),
    score: region?.score ?? null,
    remark: String(region?.remark || '').trim(),
    sortOrder,
    x: Number(region?.x ?? 0),
    y: Number(region?.y ?? 0),
    width: Number(region?.width ?? 0),
    height: Number(region?.height ?? 0)
  }
}

export function normalizePaperRegions(regions?: Partial<PaperRegionItem>[] | null) {
  return (regions || []).map((region, index) => normalizePaperRegion(region, index))
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
export function fetchImportScore(params: { projectId: string; subjectName: string; file: File }) {
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

/**
 * 保存单个学生成绩
 */
export function fetchSaveStudentScore(params: {
  projectId: string
  subjectName: string
  studentNo: string
  questionScores: number[]
}) {
  return api.post<void>({
    url: '/api/system/exam-project/scores/save',
    params: {
      projectId: params.projectId,
      subjectName: params.subjectName,
      studentNo: params.studentNo
    },
    data: params.questionScores
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

/**
 * 上传公共试卷(样板/原卷)
 */
export function fetchUploadPublicPaper(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original'
  file: File
}) {
  const formData = new FormData()
  formData.append('projectId', params.projectId)
  formData.append('subjectName', params.subjectName)
  formData.append('type', params.type)
  formData.append('file', params.file)
  return api.post<string>({
    url: '/api/system/exam-project/papers/upload-public',
    data: formData,
    showSuccessMessage: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取试卷配置
 */
export function fetchPaperConfig(params: { projectId: string; subjectName: string }) {
  return api
    .get<{
      templateUrl: string | null
      originalUrl: string | null
      templateRegions: PaperRegionItem[]
      originalRegions: PaperRegionItem[]
    }>({
      url: '/api/system/exam-project/papers/config',
      params
    })
    .then((res) => ({
      ...res,
      templateRegions: normalizePaperRegions(res.templateRegions),
      originalRegions: normalizePaperRegions(res.originalRegions)
    }))
}

export function fetchSavePaperLayout(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original'
  regions: PaperRegionItem[]
}) {
  return api.post<void>({
    url: '/api/system/exam-project/papers/layout/save',
    data: {
      ...params,
      regions: normalizePaperRegions(params.regions)
    }
  })
}
