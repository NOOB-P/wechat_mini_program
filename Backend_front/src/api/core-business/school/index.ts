import api from '@/utils/http'

/** 获取学校架构树 */
export function fetchGetSchoolTree() {
  return api.get<any>({
    url: '/api/system/school/tree'
  })
}

/** 获取所有学校（不分页） */
export function fetchGetAllSchools() {
  return api.get<any>({
    url: '/api/system/school/all'
  })
}

/** 获取学校平铺列表 */
export function fetchGetSchoolList(params?: { current?: number, size?: number, keyword?: string, province?: string, city?: string, name?: string }) {
  return api.get<any>({
    url: '/api/system/school/list',
    params
  })
}

/** 获取学校选项列表 */
export function fetchGetSchoolOptions() {
  return api.get<any>({
    url: '/api/system/school/options'
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
export function fetchDeleteSchool(id: string | number, cascade = false) {
  return api.del<any>({
    url: `/api/system/school/delete/${id}`,
    params: { cascade }
  })
}

/** 批量删除学校 */
export function fetchBatchDeleteSchools(ids: (string | number)[]) {
  return api.post<any>({
    url: '/api/system/school/batch-delete',
    data: { ids }
  })
}

/** 导入 Excel */
export function fetchImportExcel(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post<any>({
    url: '/api/system/school/import',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

import { useUserStore } from '@/store/modules/user'

/** 下载导入模板 */
export function fetchDownloadSchoolTemplate() {
  const token = useUserStore().accessToken || ''
  // 修正下载链接
  const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || ''
  window.open(`${baseUrl}/api/system/school/download-template?token=${token}`, '_blank')
}
