import request from '@/utils/request'

export const getSemesterListApi = () => {
  return request({
    url: '/api/app/score/semester/list',
    method: 'GET'
  })
}

export const getStudentScoresApi = (params: any) => {
  return request({
    url: '/api/app/score/list',
    method: 'GET',
    data: params
  })
}

export const getScoreCompositionApi = (params: any) => {
  return request({
    url: '/api/app/score/composition',
    method: 'GET',
    data: params
  })
}

export const getScoreDistributionApi = (params: any) => {
  return request({
    url: '/api/app/score/distribution',
    method: 'GET',
    data: params
  })
}

export const getScoreTrendApi = (params: any) => {
  return request({
    url: '/api/app/score/trend',
    method: 'GET',
    data: params
  })
}

export const getAiExamReportApi = (params: any) => {
  return request({
    url: '/api/app/score/ai-report',
    method: 'GET',
    data: params
  })
}

export const getWrongPushRecommendApi = (data: any) => {
  return request({
    url: '/api/app/score/wrong-push/recommend',
    method: 'POST',
    data
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
