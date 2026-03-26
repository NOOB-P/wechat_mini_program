import request from '@/utils/request'

/**
 * @Description: 获取学生成绩数据
 * @param {string} studentId 学生ID
 */
export const getStudentScoresApi = (studentId?: string) => {
  return request({
    url: '/score/list',
    method: 'GET',
    data: { studentId }
  })
}