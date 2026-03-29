import request from '@/utils/request'

export const getCourseListApi = () => {
  return request({ url: '/course/list', method: 'GET' })
}

export const getCourseDetailApi = (courseName: string) => {
  return request({ url: '/course/detail', method: 'GET', data: { name: courseName } })
}
