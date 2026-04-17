import api from '@/utils/http'

export const getPaperListApi = (params: any) => {
  return api.get<any>({
    url: '/api/admin/resource/paper/list',
    params
  })
}

export const savePaperApi = (data: any) => {
  return api.post<any>({
    url: '/api/admin/resource/paper/save',
    data
  })
}

export const deletePaperApi = (id: number) => {
  return api.del<any>({
    url: `/api/admin/resource/paper/delete/${id}`
  })
}

// 统计相关
export const getTypeStatsApi = () => {
  return api.get<any[]>({
    url: '/api/admin/resource/paper/type/stats'
  })
}

export const getGradeStatsApi = (type: string) => {
  return api.get<any[]>({
    url: '/api/admin/resource/paper/grade/stats',
    params: { type }
  })
}

export const getSubjectStatsApi = (type: string, grade: string) => {
  return api.get<any[]>({
    url: '/api/admin/resource/paper/subject/stats',
    params: { type, grade }
  })
}

export const getSubjectsApi = () => {
  return api.get<any>({
    url: '/api/admin/resource/paper/subjects'
  })
}

export const saveSubjectApi = (data: any) => {
  return api.post<any>({
    url: '/api/admin/resource/paper/subject/save',
    data
  })
}

export const deleteSubjectApi = (id: number) => {
  return api.del<any>({
    url: `/api/admin/resource/paper/subject/delete/${id}`
  })
}

export const uploadPaperApi = (data: FormData) => {
  return api.post<string>({
    url: '/api/admin/resource/paper/upload',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
