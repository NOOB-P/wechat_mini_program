import api from '@/utils/http'

export const getClassList = (params?: any) => {
  return api.get<any>({
    url: '/api/system/class/list',
    params
  })
}

export const addClass = (data: any) => {
  return api.post<any>({
    url: '/api/system/class/add',
    data
  })
}

export const updateClass = (id: number, data: any) => {
  return api.put<any>({
    url: `/api/system/class/update/${id}`,
    data
  })
}

export const deleteClass = (id: number) => {
  return api.del<any>({
    url: `/api/system/class/delete/${id}`
  })
}
