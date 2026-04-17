import api from '@/utils/http'

/** 获取学生列表 */
export function fetchGetStudentList(params: { current?: number, size?: number, keyword?: string, schoolId?: string, classId?: string }) {
  return api.get<any>({
    url: '/api/students/list',
    params: {
      page: params.current || 1,
      size: params.size || 10,
      keyword: params.keyword,
      schoolId: params.schoolId,
      classId: params.classId
    }
  })
}

/** 新增学生 */
export function fetchAddStudent(params: Partial<Api.Student.StudentItem>) {
  return api.post<any>({
    url: '/api/students/add',
    data: params
  })
}

/** 更新学生 */
export function fetchUpdateStudent(params: Partial<Api.Student.StudentItem>) {
  return api.put<any>({
    url: '/api/students/edit',
    data: params
  })
}

/** 删除学生 */
export function fetchDeleteStudent(id: string) {
  return api.del<any>({
    url: `/api/students/delete/${id}`
  })
}

/** 批量删除学生 */
export function fetchBatchDeleteStudents(ids: (string | number)[]) {
  return api.post<any>({
    url: '/api/students/batch-delete',
    data: { ids }
  })
}

/** 获取学生绑定的家长手机号列表 */
export function fetchGetBoundParents(id: string) {
  return api.get<string[]>({
    url: `/api/students/bound-parents/${id}`
  })
}

/** 批量开通 VIP/SVIP */
export function fetchBatchUpdateStatus(params: Api.Student.BatchOpParams) {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: null
  })
}

/** 导入学生 Excel */
export function fetchImportStudents(file: File, schoolId?: string, classId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post<any>({
    url: '/api/students/import',
    params: {
      schoolId,
      classId
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

import { useUserStore } from '@/store/modules/user'

/** 下载导入模板 */
export function fetchDownloadTemplate() {
  const token = useUserStore().accessToken || ''
  // 修正下载链接
  const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || ''
  window.open(`${baseUrl}/api/students/download-template?token=${token}`, '_blank')
}
