import request from '@/utils/request'

/**
 * @Description: 获取 FAQ 分类列表
 */
export const getFaqCategoryApi = () => {
  return request({
    url: '/api/customer/faq/categories',
    method: 'GET'
  })
}

/**
 * @Description: 获取 FAQ 问题列表
 */
export const getFaqListApi = (data: { categoryName?: string; question?: string }) => {
  return request({
    url: '/api/customer/faq/list',
    method: 'GET',
    data: data
  })
}
