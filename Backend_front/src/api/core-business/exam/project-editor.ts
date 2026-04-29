import api from '@/utils/http'
import { normalizeQuestionNo } from '@/utils/exam-utils'

const PAPER_UPLOAD_TIMEOUT = 10 * 60 * 1000
const PAPER_OCR_TIMEOUT = 180000

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
  answerSheetLayouts?: string | null
  hasScore: boolean
  totalScore: number | null
  updateTime?: string | number[] | null
}

export interface ScoreImportConflictCandidate {
  studentNo: string
  studentName: string
  school: string
  grade: string
  className: string
}

export interface ScoreImportConflictItem {
  rowIndex: number
  identifier: string
  studentName: string
  questionScores: number[]
  totalScore: number
  candidates: ScoreImportConflictCandidate[]
}

export interface ScoreImportResult {
  summary: string
  successCount: number
  skipCount: number
  errorCount: number
  conflictCount: number
  logs: string[]
  conflicts: ScoreImportConflictItem[]
}

export interface BatchImportResult {
  summary: string
  successCount: number
  skipCount: number
  errorCount: number
  logs: string[]
}

export interface PaperRegionItem {
  id: string
  questionNo: string
  questionType: string
  partTitle?: string
  knowledgePoint: string
  questionText: string
  remark?: string
  score: number | null
  sortOrder: number
  x: number
  y: number
  width: number
  height: number
}

export interface PaperMergePageItem {
  pageIndex: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  xRatio: number
  yRatio: number
  widthRatio: number
  heightRatio: number
}

export interface PaperMergeInfo {
  sourceType: string
  imageWidth: number
  imageHeight: number
  pageCount: number
  pages: PaperMergePageItem[]
}

export interface PaperOcrAutoCutResult {
  projectId: string
  subjectName: string
  type: 'template' | 'original'
  paperUrl: string
  requestId: string
  ocrSubject: string
  imageType: string
  cutType: string
  pageCount: number
  pageResults?: Record<string, any>[]
  recognizedCount: number
  regions: PaperRegionItem[]
}

export interface PaperOcrPageResult {
  pageIndex: number
  pageCount: number
  paperUrl: string
  requestId: string
  ocrSubject: string
  imageType: string
  cutType: string
  recognizedCount: number
  pageInfo?: PaperMergePageItem
  regions: PaperRegionItem[]
}

export interface PaperQuestionOcrResult {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  requestId: string
  questionText: string
  questionType: string
  score: number | null
  knowledgePoint?: string
  analysis?: Record<string, any>
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
    partTitle: String(region?.partTitle || '').trim(),
    knowledgePoint: String(region?.knowledgePoint || '').trim(),
    questionText: String(region?.questionText || region?.remark || '').trim(),
    score: region?.score ?? null,
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
  return api.post<ScoreImportResult>({
    url: '/api/system/exam-project/scores/import',
    data: formData,
    showSuccessMessage: false,
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
  return api.post<BatchImportResult>({
    url: '/api/system/exam-project/papers/import',
    data: formData,
    timeout: PAPER_UPLOAD_TIMEOUT,
    showSuccessMessage: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取任务进度
 */
export function fetchTaskProgress(taskId: string) {
  return api.get<any>({
    url: `/api/system/task/progress/${taskId}`
  })
}

/**
 * 上传单个学生答题卡
 */
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
    timeout: PAPER_UPLOAD_TIMEOUT,
    showErrorMessage: false,
    showSuccessMessage: false,
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
      templateMergeInfo: PaperMergeInfo
      originalMergeInfo: PaperMergeInfo
      templateRegions: PaperRegionItem[]
      originalRegions: PaperRegionItem[]
    }>({
      url: '/api/system/exam-project/papers/config',
      params,
      showErrorMessage: false
    })
    .then((res) => ({
      ...res,
      templateMergeInfo: res.templateMergeInfo || { sourceType: '', imageWidth: 0, imageHeight: 0, pageCount: 0, pages: [] },
      originalMergeInfo: res.originalMergeInfo || { sourceType: '', imageWidth: 0, imageHeight: 0, pageCount: 0, pages: [] },
      templateRegions: normalizePaperRegions(res.templateRegions),
      originalRegions: normalizePaperRegions(res.originalRegions)
    }))
}

export function fetchSavePaperLayout(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  applyToAllStudents?: boolean
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

export function fetchAutoCutPaperLayout(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  imageType?: string
}) {
  return api
    .post<PaperOcrAutoCutResult>({
      url: '/api/system/exam-project/papers/layout/ocr-auto',
      data: params,
      timeout: PAPER_OCR_TIMEOUT,
      showErrorMessage: false
    })
    .then((res) => ({
      ...res,
      regions: normalizePaperRegions(res.regions)
    }))
}

export function fetchStartAutoCutTask(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  imageType?: string
}) {
  return api.post<string>({
    url: '/api/system/exam-project/papers/layout/ocr-auto/start',
    data: params
  })
}

export function fetchOcrTaskStatus(taskId: string) {
  return api.get<{
    taskId: string
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
    progress: number
    message: string
    result: any
  }>({
    url: `/api/system/exam-project/papers/layout/ocr-auto/status/${taskId}`
  })
}

export function fetchOcrPaperLayoutPage(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  pageIndex: number
  imageType?: string
}) {
  return api
    .post<PaperOcrPageResult>({
      url: '/api/system/exam-project/papers/layout/ocr-page',
      data: params,
      timeout: PAPER_OCR_TIMEOUT,
      showErrorMessage: false
    })
    .then((res) => ({
      ...res,
      regions: normalizePaperRegions(res.regions)
    }))
}

export function fetchOcrPaperQuestion(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  partTitle?: string
  imageType?: string
  x: number
  y: number
  width: number
  height: number
}) {
  return api.post<PaperQuestionOcrResult>({
    url: '/api/system/exam-project/papers/layout/ocr-question',
    data: params,
    timeout: PAPER_OCR_TIMEOUT,
    showErrorMessage: false
  })
}

export function fetchAnalyzePaperQuestion(params: {
  projectId: string
  subjectName: string
  type: 'template' | 'original' | 'student'
  studentNo?: string
  partTitle?: string
  imageType?: string
  x: number
  y: number
  width: number
  height: number
}) {
  return api.post<PaperQuestionOcrResult>({
    url: '/api/system/exam-project/papers/layout/analyze-question',
    data: params,
    timeout: PAPER_OCR_TIMEOUT,
    showErrorMessage: false
  })
}
