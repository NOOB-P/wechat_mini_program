import request from '@/utils/http'

/** 获取课程列表 */
export function getCourseList(params?: { isSvipOnly?: boolean; isFree?: boolean; current?: number; size?: number }) {
  return request.get<{ list: any[]; total: number }>({
    url: '/api/system/course/list',
    params
  })
}

/** 新增课程 */
export function addCourse(data: any) {
  return request.post({
    url: '/api/system/course/add',
    data
  })
}

/** 更新课程 */
export function updateCourse(data: any) {
  return request.put({
    url: '/api/system/course/update',
    data
  })
}

/** 删除课程 */
export function deleteCourse(id: string) {
  return request.del({
    url: `/api/system/course/delete/${id}`
  })
}

/** 修改课程状态 */
export function changeCourseStatus(id: string, status: number) {
  return request.post({
    url: '/api/system/course/status',
    data: { id, status }
  })
}
