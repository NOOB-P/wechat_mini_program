import request from '@/utils/request'

/**
 * @Description: 获取试卷详情数据
 * @param {string} examId 考试ID或试卷ID
 */
export const getPaperDetailApi = (examId?: string) => {
  return request({
    url: '/api/app/paper/detail',
    method: 'GET',
    data: { examId }
  })
}