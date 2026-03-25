import type { MockResponse } from '../index'

const mineMocks: Record<string, (data: any) => MockResponse> = {
  '/mine/info': () => {
    return {
      code: 200,
      msg: '获取用户信息成功 (Mock)',
      data: {
        avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        nickname: 'zxp114...',
        grade: '七年级',
        phone: '152****9802'
      }
    }
  },
  '/mine/update': (data) => {
    return {
      code: 200,
      msg: '更新用户信息成功 (Mock)',
      data
    }
  },
  '/mine/settings': () => {
    return {
      code: 200,
      msg: '获取设置信息成功 (Mock)',
      data: {
        version: '1.8.2575'
      }
    }
  }
}

export default mineMocks
