import request from '@/utils/request'

/**
 * @Description: 获取学期及考试列表
 */
export const getSemesterListApi = () => {
  return request({
    url: '/api/app/score/semester/list',
    method: 'GET'
  })
}

/**
 * @Description: 获取学生成绩数据
 * @param {object} params 查询参数 (semester, examId)
 */
export const getStudentScoresApi = (params: any) => {
  return request({
    url: '/api/app/score/list',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 获取成绩构成分析详情
 * @param {object} params 查询参数 (examId, subjectId)
 */
export const getScoreCompositionApi = (params: any) => {
  return request({
    url: '/api/app/score/composition',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 获取分数分布统计
 * @param {object} params 查询参数 (examId, subjectId)
 */
export const getScoreDistributionApi = (params: any) => {
  return request({
    url: '/api/app/score/distribution',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 获取近六次考试趋势
 * @param {object} params 查询参数 (examId)
 */
export const getScoreTrendApi = (params: any) => {
  return request({
    url: '/api/app/score/trend',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 获取考试 AI 成绩报告（首次生成后缓存）
 * @param {object} params 查询参数 (examId, refresh)
 */
export const getAiExamReportApi = (params: any) => {
  return request({
    url: '/api/app/score/ai-report',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 导出考试 AI 成绩报告 PDF
 * @param {object} params 查询参数 (examId)
 */
export const exportAiExamReportApi = (params: any) => {
  return request({
    url: '/api/app/score/ai-report/export',
    method: 'GET',
    data: params
  })
}

/**
 * @Description: 导出错题集 PDF
 * @param {object} params 查询参数 (examId, subject)
 */
export const exportWrongBookApi = (params: any) => {
  return request({
    url: '/api/app/score/wrong-book/export',
    method: 'GET',
    data: params
  })
}
