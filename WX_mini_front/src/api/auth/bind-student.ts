import request from '@/utils/request'

/**
 * @Description: 绑定学生账号 - 发送验证码
 * @param {string} phone 手机号
 */
export const sendBindStudentCode = (phone: string) => {
  return request({
    url: '/auth/bind-student/sendCode',
    method: 'POST',
    data: { phone }
  })
}

/**
 * @Description: 确认绑定学生账号
 * @param {object} data { studentName, studentId, password, phone, code }
 */
export const bindStudentAccount = (data: {
  studentName: string
  studentId: string
  password: string
  phone: string
  code: string
}) => {
  return request({
    url: '/auth/bind-student/confirm',
    method: 'POST',
    data
  })
}
