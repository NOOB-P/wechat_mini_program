import request from '@/utils/http'

/**
 * 获取 SVIP 课程列表
 */
export function fetchGetSvipCourseList(params: any) {
  return request.get<{ list: any[]; total: number }>({
    url: '/api/system/course/list',
    params: { ...params, isSvipOnly: true }
  })
}

/**
 * 删除 SVIP 课程
 */
export function fetchDeleteSvipCourse(id: string) {
  return request.del({
    url: `/api/system/course/delete/${id}`
  })
}

/**
 * 修改 SVIP 课程状态
 */
export function fetchChangeSvipCourseStatus(id: string, status: number) {
  return request.post({
    url: '/api/system/course/status',
    data: { id, status }
  })
}

/**
 * 新增/更新 SVIP 课程
 */
export function fetchSaveSvipCourse(data: any) {
  const isEdit = !!data.id
  return request({
    url: isEdit ? '/api/system/course/update' : '/api/system/course/add',
    method: isEdit ? 'PUT' : 'POST',
    data: { ...data, isSvipOnly: true }
  })
}
