import request from '@/utils/request'

/**
 * @Description: 获取设置信息
 */
export const getSettingsInfoApi = () => {
  return request({
    url: '/mine/settings',
    method: 'GET'
  })
}
