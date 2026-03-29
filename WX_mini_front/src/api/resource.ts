import request from '@/utils/request'

export const getStudentTalkListApi = () => {
  return request({ url: '/resource/student-talk/list', method: 'GET' })
}

export const getFamilyEduListApi = () => {
  return request({ url: '/resource/family-edu/list', method: 'GET' })
}

export const getSyncCourseListApi = (data: { subject: string }) => {
  return request({ url: '/resource/sync-course/list', method: 'POST', data })
}

export const getPaperListApi = (data: { keyword?: string, subject?: string }) => {
  return request({ url: '/resource/paper/list', method: 'POST', data })
}
