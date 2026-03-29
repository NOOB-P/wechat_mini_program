import request from '@/utils/request'

export const getStudentTalkListApi = () => {
  return request({ url: '/resource/student-talk/list', method: 'GET' })
}

export const getFamilyEduListApi = () => {
  return request({ url: '/resource/family-edu/list', method: 'GET' })
}

/**
 * @Description: 获取同步辅导列表
 */
export const getSyncCourseListApi = (params?: any) => {
  return request({
    url: '/resource/sync-course/list',
    method: 'POST',
    data: params
  })
}

/**
 * @Description: 获取同步辅导的年级和科目选项
 */
export const getSyncCourseOptionsApi = () => {
  return request({
    url: '/resource/sync-course/options',
    method: 'GET'
  })
}

/**
 * @Description: 获取历年真题列表
 */
export const getPaperListApi = (params?: any) => {
  return request({
    url: '/resource/paper/list',
    method: 'POST',
    data: params
  })
}

/**
 * @Description: 获取历年真题的科目列表
 */
export const getPaperSubjectsApi = () => {
  return request({
    url: '/resource/paper/subjects',
    method: 'GET'
  })
}
