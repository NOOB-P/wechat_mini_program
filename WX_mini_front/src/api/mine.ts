import request from '@/utils/request'

/**
 * @Description: 获取当前登录用户信息 (个人中心使用)
 */
export const getMineInfoApi = () => {
  return request({
    url: '/api/app/mine/info',
    method: 'GET'
  })
}

/**
 * @Description: 更新当前用户基本信息 (个人中心修改昵称等)
 */
export const updateMineInfoApi = (data: any) => {
  return request({
    url: '/api/app/mine/update',
    method: 'POST',
    data
  })
}

/**
 * @Description: 修改当前用户密码 (个人设置使用)
 */
export const updatePasswordApi = (data: { oldPassword: String, newPassword: String }) => {
  return request({
    url: '/api/app/mine/settings',
    method: 'POST',
    data
  })
}

/**
 * @Description: 退出登录 (个人设置使用)
 */
export const logoutApi = () => {
  return request({
    url: '/api/app/mine/logout',
    method: 'POST'
  })
}

/**
 * @Description: 上传头像
 */
export const uploadAvatarApi = (filePath: string) => {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${__VITE_SERVER_BASEURL__}/api/app/mine/upload`, // 使用全局配置的地址
      filePath: filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve(data)
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 保留原有的 getUserInfoApi，以便首页或其他地方使用
export const getUserInfoApi = () => {
  return request({
    url: '/api/app/mine/info',
    method: 'GET'
  })
}
