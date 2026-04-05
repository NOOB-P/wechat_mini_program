import api from '@/utils/http'

export interface ExamProject {
  id?: string
  name: string
  createTime?: string
  updateTime?: string
}

/** 获取项目列表 */
export function fetchGetProjectList(params: {
  current?: number
  size?: number
  name?: string
}) {
  return api.get<any>({
    url: '/api/system/exam-project/list',
    params
  })
}

/** 新增项目 */
export function fetchAddProject(data: ExamProject) {
  return api.post<any>({
    url: '/api/system/exam-project/add',
    data
  })
}

/** 更新项目 */
export function fetchUpdateProject(data: ExamProject) {
  return api.put<any>({
    url: '/api/system/exam-project/edit',
    data
  })
}

/** 删除项目 */
export function fetchDeleteProject(id: string) {
  return api.del<any>({
    url: `/api/system/exam-project/delete/${id}`
  })
}