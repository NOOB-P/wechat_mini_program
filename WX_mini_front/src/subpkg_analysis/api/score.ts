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

export const exportWrongBookApi = (params: any) => {
  return request({
    url: '/api/app/score/wrong-book/export',
    method: 'GET',
    data: params
  })
}
