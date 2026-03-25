import request from '@/utils/request'

/**
 * @Description: 获取课程列表
 */
export const getCourseListApi = () => {
  return request({
    url: '/course/list',
    method: 'GET'
  })
}

/**
 * @Description: 获取课程详情
 * @param {string} id 课程ID
 */
export const getCourseDetailApi = (id: string) => {
  return request({
    url: `/course/detail/${id}`,
    method: 'GET'
  })
}
