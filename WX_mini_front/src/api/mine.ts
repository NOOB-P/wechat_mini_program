import request from '@/utils/request'

/**
 * @Description: 获取用户信息
 */
export const getUserInfoApi = () => {
  return request({
    url: '/mine/info',
    method: 'GET'
  })
}

/**
 * @Description: 更新用户信息
 */
export const updateUserInfoApi = (data: any) => {
  return request({
    url: '/mine/update',
    method: 'POST',
    data
  })
}
