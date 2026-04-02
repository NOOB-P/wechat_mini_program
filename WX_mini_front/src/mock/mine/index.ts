import type { MockResponse } from '../index'

const mineMocks: Record<string, (data: any) => MockResponse> = {
  // 注释掉个人中心相关的 mock，强制调用后端真实接口
  /*
  '/mine/info': () => {
    ...
  },
  */
  // 保留一些基础 mock 或者完全清空
  '/mine/version': () => {
    return {
      code: 200,
      msg: 'success',
      data: {
        version: '1.0.0'
      }
    }
  }
}

export default mineMocks
