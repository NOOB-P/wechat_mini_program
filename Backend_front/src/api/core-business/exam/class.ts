import api from '@/utils/http'

export interface ExamClass {
  id?: string
  projectId: string
  school: string
  grade: string
  className: string
  createTime?: string
  updateTime?: string
}

/** 获取班级列表 */
export function fetchGetClassList(params: {
  current?: number
  size?: number
  projectId: string
  school?: string
  grade?: string
  className?: string
}) {
  return api.get<any>({
    url: '/api/system/exam-class/list',
    params
  })
}

/** 新增班级 */
export function fetchAddClass(data: ExamClass) {
  return api.post<any>({
    url: '/api/system/exam-class/add',
    data
  })
}

/** 更新班级 */
export function fetchUpdateClass(data: ExamClass) {
  return api.put<any>({
    url: '/api/system/exam-class/edit',
    data
  })
}

/** 删除班级 */
export function fetchDeleteClass(id: string) {
  return api.del<any>({
    url: `/api/system/exam-class/delete/${id}`
  })
}