import request from '@/utils/request'

/**
 * @Description: 获取学期及考试列表
 */
export const getSemesterListApi = () => {
  return request({
    url: '/score/semester/list',
    method: 'GET'
  })
}

/**
 * @Description: 获取学生成绩数据
 * @param {object} params 查询参数 (semester, examId)
 */
export const getStudentScoresApi = (params: any) => {
  return request({
    url: '/score/list',
    method: 'GET',
    data: params
  })
}