import api from '@/utils/http'

export const getClassList = (params?: any) => {
  return api.get<any>({
    url: '/api/system/class/list',
    params
  })
}

export const getClassOptions = (schoolId: string) => {
  return api.get<any>({
    url: '/api/system/class/options',
    params: { schoolId }
  })
}
export const addClass = (data: any) => {
  return api.post<any>({
    url: '/api/system/class/add',
    data
  })
}

export const batchAddClasses = (data: any) => {
  return api.post<any>({
    url: '/api/system/class/batch-add',
    data
  })
}

export const updateClass = (id: number, data: any) => {
  return api.put<any>({
    url: `/api/system/class/update/${id}`,
    data
  })
}

export const deleteClass = (id: number, cascade = false) => {
  return api.del<any>({
    url: `/api/system/class/delete/${id}`,
    params: { cascade }
  })
}

export const batchDeleteClasses = (ids: (string | number)[]) => {
  return api.post<any>({
    url: '/api/system/class/batch-delete',
    data: { ids }
  })
}

export function fetchImportClass(file: File, schoolId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post<any>({
    url: '/api/system/class/import',
    params: {
      schoolId
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function fetchDownloadClassTemplate() {
  const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || ''
  window.open(`${baseUrl}/api/system/class/download-template`, '_blank')
}
