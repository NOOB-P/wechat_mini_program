import { mockSchoolTree } from '@/mock/core-business/school'

/** 获取学校架构树 */
export function fetchGetSchoolTree() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockSchoolTree as Api.School.ArchitectureNode[]
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
