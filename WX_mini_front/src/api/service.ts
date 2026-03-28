import request from '@/utils/request'

/**
 * @Description: 获取 FAQ 分类列表
 */
export const getFaqCategoryApi = () => {
  return request({
    url: '/service/faq/categories',
    method: 'GET'
  })
}

/**
 * @Description: 获取 FAQ 问题列表
 */
export const getFaqListApi = (data: { categoryId?: number; keyword?: string }) => {
  return request({
    url: '/service/faq/list',
    method: 'POST',
    data
  })
}
