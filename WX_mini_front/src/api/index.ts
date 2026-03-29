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
 * @Description: 获取首页 AI 公益课程数据
 */
export const getHomePublicCoursesApi = () => {
  return request({
    url: '/home/publicCourses',
    method: 'GET'
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
