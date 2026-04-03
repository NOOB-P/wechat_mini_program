import api from '@/utils/http'

/** 获取学校架构树 */
export function fetchGetSchoolTree() {
  return api.get<any>({
    url: '/api/system/school/tree'
  })
}

/** 获取学校平铺列表 */
export function fetchGetSchoolList(params?: { keyword?: string, province?: string, city?: string, name?: string }) {
  return api.get<any>({
    url: '/api/system/school/list',
    params
  })
}

/** 新增学校 */
export function fetchAddSchool(params: { province: string, city: string, name: string }) {
  return api.post<any>({
    url: '/api/system/school/add',
    data: params
  })
}

/** 新增节点 */
export function fetchAddNode(params: Api.School.NodeParams) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

/** 修改节点 */
export function fetchUpdateSchool(params: { id: string, province: string, city: string, name: string }) {
  return api.put<any>({
    url: '/api/system/school/edit',
    data: params
  })
}

/** 删除节点 */
export function fetchDeleteSchool(id: string) {
  return api.del<any>({
    url: `/api/system/school/delete/${id}`
  })
}

/** 导入 Excel */
export function fetchImportExcel(file: File) {
  return Promise.resolve({
    code: 200,
    msg: '导入成功',
    data: null
  })
}
