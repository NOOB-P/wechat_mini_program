import request from '@/utils/request'

/**
 * @Description: 获取用户信息
 */
export const getUserInfoApi = () => {
  return request({
    url: '/api/auth/info',
    method: 'GET'
  })
}

/**
 * @Description: 更新用户信息
 */
export const updateUserInfoApi = (uid: number, data: any) => {
  return request({
    url: `/api/auth/userInfo/${uid}`,
    method: 'PUT',
    data
  })
}
