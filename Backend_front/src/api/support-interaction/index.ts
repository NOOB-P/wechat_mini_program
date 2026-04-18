import api from '@/utils/http'

/**
 * FAQ 相关接口
 */
export function fetchGetFaqList(params: any) {
  return api.get<any>({
    url: '/api/customer/faq/list',
    params
  })
}

export function fetchGetFaqCategories() {
  return api.get<any>({
    url: '/api/customer/faq/categories'
  })
}

/**
 * FAQ 分类管理接口
 */
export function fetchAddFaqCategory(data: any) {
  return api.post<any>({
    url: '/api/customer/faq/category/add',
    data
  })
}

export function fetchGetFaqCategoryList() {
  return api.get<any>({
    url: '/api/customer/faq/category/list'
  })
}

export function fetchUpdateFaqCategory(data: any) {
  return api.put<any>({
    url: `/api/customer/faq/category/edit/${data.id}`,
    data
  })
}

export function fetchDeleteFaqCategory(id: number) {
  return api.del<any>({
    url: `/api/customer/faq/category/delete/${id}`
  })
}

export function fetchAddFaq(params: any) {
  return api.post<any>({
    url: '/api/customer/faq/add',
    data: params
  })
}

export function fetchUpdateFaq(params: any) {
  return api.put<any>({
    url: `/api/customer/faq/edit/${params.id}`,
    data: params
  })
}

export function fetchDeleteFaq(id: string | number) {
  return api.del<any>({
    url: `/api/customer/faq/delete/${id}`
  })
}

/**
 * 企业微信客服配置接口
 */
export function fetchGetWechatConfigList() {
  return api.get<any>({
    url: '/api/customer/wechat/list'
  })
}

export function fetchAddWechatConfig(data: any) {
  return api.post<any>({
    url: '/api/customer/wechat/add',
    data
  })
}

export function fetchUpdateWechatConfig(data: any) {
  return api.put<any>({
    url: `/api/customer/wechat/edit/${data.id}`,
    data
  })
}

export function fetchDeleteWechatConfig(id: number) {
  return api.del<any>({
    url: `/api/customer/wechat/delete/${id}`
  })
}
