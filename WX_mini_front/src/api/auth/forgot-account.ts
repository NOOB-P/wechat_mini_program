import request from '@/utils/request'

/**
 * @Description: 忘记账号 - 根据学生信息查找
 * @param {object} data { studentName, schoolId }
 */
export const findAccountByStudentInfo = (data: { studentName: string; schoolId: string }) => {
  return request({
    url: '/auth/forgot-account/find',
    method: 'POST',
    data
  })
}
