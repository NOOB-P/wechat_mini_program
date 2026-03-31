import api from '@/utils/http'
import { mockWechatConfig } from '@/mock/support-interaction/config'

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
 * 微信配置相关接口
 */
export function fetchGetWechatConfig() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockWechatConfig
  })
}

export function fetchUpdateWechatConfig(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}
