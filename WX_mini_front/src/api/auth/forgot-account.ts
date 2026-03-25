import request from '@/utils/request'

/**
<<<<<<< HEAD
 * @Description: 获取学校列表
 */
export const getSchoolList = () => {
  return request({
    url: '/auth/school/list',
    method: 'GET'
  })
}

/**
=======
>>>>>>> 6b2f62dac9451053cd09d1eae0fd6f31d7995d35
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
