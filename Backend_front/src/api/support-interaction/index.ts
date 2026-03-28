import { mockFaqList, mockWechatConfig } from '@/mock/support-interaction/config'

/**
 * FAQ 相关接口
 */
export function fetchGetFaqList(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      list: mockFaqList,
      total: mockFaqList.length
    }
  })
}

export function fetchAddFaq(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

export function fetchUpdateFaq(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

export function fetchDeleteFaq(id: string) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
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
