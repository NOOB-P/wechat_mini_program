import request from '@/utils/request'

export const getStudentTalkListApi = (params?: any) => {
  return request({ 
    url: '/api/app/resource/student-talk/list', 
    method: 'GET',
    data: params 
  })
}

export const getFamilyEduListApi = (params?: any) => {
  return request({ 
    url: '/api/app/resource/family-edu/list', 
    method: 'GET',
    data: params 
  })
}

/**
 * @Description: 获取同步辅导列表
 */
export const getSyncCourseListApi = (params?: any) => {
  return request({
    url: '/api/app/resource/sync-course/list',
    method: 'GET', // 改为 GET 以配合后端
    data: params
  })
}

/**
 * @Description: 获取同步辅导的年级和科目选项
 */
export const getSyncCourseOptionsApi = () => {
  return request({
    url: '/api/app/resource/sync-course/options',
    method: 'GET'
  })
}

export const getPaperListApi = (params: any) => {
  return request({
    url: '/api/app/resource/paper/list',
    method: 'GET',
    data: params
  })
}

/** 获取名校试卷科目 */
export const getPaperSubjectsApi = () => {
  return request({
    url: '/api/app/resource/paper/subjects',
    method: 'GET'
  })
}

export const incrementPaperDownloadApi = (id: string | number) => {
  return request({
    url: `/api/app/resource/paper/download/${id}`,
    method: 'POST'
  })
}
