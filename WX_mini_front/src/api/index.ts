import request from '@/utils/request'

/**
 * @Description: 获取首页统计数据
 */
export const getHomeStatsApi = () => {
  return request({
    url: '/home/stats',
    method: 'GET'
  })
}

/**
 * @Description: 获取首页轮播图数据
 */
export const getHomeBannersApi = () => {
  return request({
    url: '/home/banners',
    method: 'GET'
  })
}

/**
 * @Description: 获取首页公共课程
 */
export const getHomePublicCoursesApi = () => {
  return request({
    url: '/api/app/home/courses/public',
    method: 'GET'
  })
}

/**
 * @Description: 根据位置获取微信二维码
 */
export const getWechatQrByLocationApi = (location: string) => {
  return request({
    url: '/api/customer/wechat/get-by-location',
    method: 'GET',
    data: { location }
  })
}

/**
 * @Description: 获取首页推荐课程
 */
export const getRecommendCoursesApi = () => {
  return request({
    url: '/home/recommend',
    method: 'GET'
  })
}
