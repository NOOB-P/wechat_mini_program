import request from '@/utils/request'

/**
 * @Description: 获取学生成绩数据
 * @param {object} params 参数包含 studentId 和 semester (学期)
 */
export const getStudentScoresApi = (params?: any) => {
  return request({
    url: '/score/list',
    method: 'GET',
    data: params
  })
}