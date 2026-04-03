import api from '@/utils/http'

/** 获取学生列表 */
export function fetchGetStudentList(params: { current?: number, size?: number, keyword?: string }) {
  return api.get<any>({
    url: '/api/students/list',
    params: {
      page: params.current || 1,
      size: params.size || 10,
      keyword: params.keyword
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

/** 批量开通 VIP/SVIP */
export function fetchBatchUpdateStatus(params: Api.Student.BatchOpParams) {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: null
  })
}

/** 导入学生 Excel */
export function fetchImportStudents(file: File) {
  return Promise.resolve({
    code: 200,
    msg: '导入成功',
    data: null
  })
}
