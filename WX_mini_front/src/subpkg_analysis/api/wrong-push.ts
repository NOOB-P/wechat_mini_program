import request from '@/utils/request'

export const getWrongPushRecommendApi = (data: {
  examId: string
  subject: string
  questionNo: string
  count?: number
}) => {
  return request({
    url: '/api/app/score/wrong-push/recommend',
    method: 'POST',
    data
  })
}
