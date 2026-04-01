import api from '@/utils/http'

/** 获取学校架构树 */
export function fetchGetSchoolTree() {
  return api.get<any>({
    url: '/api/system/school/tree'
  })
}

/** 获取学校平铺列表 */
export function fetchGetSchoolList() {
  return api.get<any>({
    url: '/api/system/school/list'
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
export function fetchUpdateNode(params: Api.School.NodeParams) {
  return Promise.resolve({
    code: 200,
    msg: '修改成功',
    data: null
  })
}

/** 删除节点 */
export function fetchDeleteNode(id: string) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
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
