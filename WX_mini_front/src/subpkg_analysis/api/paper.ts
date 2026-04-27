import request from '@/utils/request'

/**
 * @Description: 获取试卷详情数据
 * @param {object} params 查询参数
 */
export const getPaperDetailApi = (params: { examId?: string; subject?: string }) => {
  return request({
    url: '/api/app/paper/detail',
    method: 'GET',
    data: params,
    silent: true
  })
}
