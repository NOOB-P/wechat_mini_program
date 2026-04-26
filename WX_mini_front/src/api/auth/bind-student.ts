import request from '@/utils/request'

/**
 * @Description: 绑定学生账号 - 发送验证码
 * @param {string} phone 手机号
 */
export const sendBindStudentCode = (phone: string) => {
  return request({
    url: '/api/app/auth/sendCode',
    method: 'POST',
    data: { phone }
  })
}

/**
 * @Description: 获取所有启用的省份
 */
export const getProvinces = () => {
  return request({ url: '/api/app/auth/provinces', method: 'GET' })
}

/**
 * @Description: 获取省份下的所有城市
 */
export const getCities = (province: string) => {
  return request({ url: '/api/app/auth/cities', method: 'GET', params: { province } })
}

/**
 * @Description: 获取城市下的所有学校
 */
export const getSchools = (city: string) => {
  return request({ url: '/api/app/auth/schools', method: 'GET', params: { city } })
}

/**
 * @Description: 获取学校下的所有年级
 */
export const getGrades = (schoolId: string) => {
  return request({ url: '/api/app/auth/grades', method: 'GET', params: { schoolId } })
}

/**
 * @Description: 获取学校年级下的所有班级
 */
export const getClasses = (schoolId: string, grade: string) => {
  return request({ url: '/api/app/auth/classes', method: 'GET', params: { schoolId, grade } })
}

/**
 * @Description: 获取学校年级班级下的所有学生
 */
export const getStudents = (schoolId: string, grade: string, className: string) => {
  return request({ url: '/api/app/auth/students', method: 'GET', params: { schoolId, grade, className } })
}

/**
 * @Description: 确认绑定学生账号 - 增加级联选择的支持
 */
export const bindStudentAccount = (data: {
  studentName?: string
  studentId: string // 这个 ID 是学生的内部 ID
  phone: string
  code: string
}) => {
  return request({
    url: '/api/app/auth/bind-student/confirm',
    method: 'POST',
    data
  })
}
