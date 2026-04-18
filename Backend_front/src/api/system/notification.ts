import api from '@/utils/http'

/**
 * 获取系统通知列表
 */
export function fetchGetNotificationList(params: any) {
  return api.get<any>({
    url: '/api/admin/notifications/list',
    params
  })
}

/**
 * 保存系统通知
 */
export function fetchSaveNotification(data: any) {
  return api.post<any>({
    url: '/api/admin/notifications/save',
    data
  })
}

/**
 * 删除系统通知
 */
export function fetchDeleteNotification(id: number | string) {
  return api.del<any>({
    url: `/api/admin/notifications/${id}`
  })
}
