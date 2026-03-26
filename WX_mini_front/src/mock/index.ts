import mineMocks from './mine/index';

export interface MockResponse {
  code: number;
  msg: string;
  data?: any;
}

const mocks: Record<string, (data: any) => MockResponse> = {
  ...mineMocks,
  '/auth/bind-student/sendCode': (data) => {
    return {
      code: 200,
      msg: '验证码已发送 (Mock)',
      data: '123456'
    };
  },
  '/auth/bind-student/confirm': (data) => {
    return {
      code: 200,
      msg: '绑定成功 (Mock)'
    };
  },
  '/auth/forgot-account/find': (data) => {
    return {
      code: 200,
      msg: '查询成功，账号已通过短信发送 (Mock)'
    };
  },
  '/auth/school/list': () => {
    return {
      code: 200,
      msg: '获取学校列表成功 (Mock)',
      data: [
        { label: '第一中学', value: '1' },
        { label: '第二实验小学', value: '2' },
        { label: '第三国际学校', value: '3' }
      ]
    };
  },
  '/login/sendCode': (data) => {
    return {
      code: 200,
      msg: '验证码已发送 (Mock)',
      data: '114514'
    };
  },
  '/login/password': (data) => {
    const { phone, password } = data;
    if (phone === '13588888888') {
      if (password === '123456') {
        return {
          code: 200,
          msg: '登录成功 (Mock)',
          data: {
            id: 1,
            phone: '13588888888',
            nickname: 'MockUser',
            token: 'mock-token-123456'
          }
        };
      } else {
        return {
          code: 400,
          msg: '密码错误 (Mock)'
        };
      }
    }
    return {
      code: 400,
      msg: '该手机号未注册 (Mock)'
    };
  },
  '/login/phone': (data) => {
    const { phone, code } = data;
    if (phone === '13588888888') {
      if (code === '114514') {
        return {
          code: 200,
          msg: '登录成功 (Mock)',
          data: {
            id: 1,
            phone: '13588888888',
            nickname: 'MockUser',
            token: 'mock-token-114514'
          }
        };
      } else {
        return {
          code: 400,
          msg: '验证码错误 (Mock)'
        };
      }
    }
    return {
      code: 400,
      msg: '该手机号未注册 (Mock)'
    };
  },
  '/login/register': (data) => {
    const { phone, code, password } = data;
    // 模拟已存在账号
    if (phone === '13588888888') {
      return {
        code: 400,
        msg: '该手机号已注册，请直接登录 (Mock)'
      };
    }
    if (code !== '114514') {
      return {
        code: 400,
        msg: '验证码错误 (Mock)'
      };
    }
    return {
      code: 200,
      msg: '注册成功 (Mock)',
      data: {
        phone,
        nickname: 'NewUser'
      }
    };
  },
  '/login/forgotPassword': (data) => {
    const { phone, code, password } = data;
    if (phone !== '13588888888') {
      return {
        code: 400,
        msg: '该手机号未注册 (Mock)'
      };
    }
    if (code !== '114514') {
      return {
        code: 400,
        msg: '验证码错误 (Mock)'
      };
    }
    return {
      code: 200,
      msg: '密码重置成功 (Mock)'
    };
  },
  '/login/thirdParty': (data) => {
    const { type, openid } = data;
    // 模拟：如果没有绑定手机号，返回需要绑定手机号的状态
    return {
      code: 200,
      msg: '需要绑定手机号 (Mock)',
      data: {
        needBind: true,
        openid: openid,
        type: type
      }
    };
  },
  '/login/bindPhone': (data) => {
    const { phone, code, openid, type } = data;
    if (code !== '114514') {
      return {
        code: 400,
        msg: '验证码错误 (Mock)'
      };
    }
    return {
      code: 200,
      msg: '绑定成功并登录 (Mock)',
      data: {
        id: 99,
        phone: phone,
        nickname: `${type === 'wechat' ? '微信' : 'QQ'}用户`,
        token: `mock-token-${type}-${openid}`
      }
    };
  },
  '/login/logout': (data) => {
    return {
      code: 200,
      msg: '退出成功 (Mock)'
    };
  },
  '/home/stats': (data) => {
    return {
      code: 200,
      msg: '获取统计数据成功 (Mock)',
      data: {
        paperCount: 12,
        wrongCount: 45,
        analysisProgress: 85
      }
    };
  },
  '/home/recommend': (data) => {
    return {
      code: 200,
      msg: '获取推荐课程成功 (Mock)',
      data: [
        { id: 1, name: '数学强化班', price: 199, image: 'https://via.placeholder.com/150' },
        { id: 2, name: '英语口语课', price: 299, image: 'https://via.placeholder.com/150' },
        { id: 3, name: '物理实验课', price: 150, image: 'https://via.placeholder.com/150' },
        { id: 4, name: '化学奥赛', price: 399, image: 'https://via.placeholder.com/150' }
      ]
    };
  },
  '/course/list': (data) => {
    return {
      code: 200,
      msg: '获取课程列表成功 (Mock)',
      data: [
        { id: 1, name: '数学基础', desc: '适合初学者', price: 99, image: 'https://via.placeholder.com/150' },
        { id: 2, name: '英语语法', desc: '精讲常用语法', price: 129, image: 'https://via.placeholder.com/150' },
        { id: 3, name: '物理力学', desc: '力学基础知识', price: 149, image: 'https://via.placeholder.com/150' },
        { id: 4, name: '化学反应', desc: '带你了解化学世界', price: 199, image: 'https://via.placeholder.com/150' }
      ]
    };
  }
};

export const getMockData = (url: string, data: any): MockResponse | null => {
  // 去掉 baseUrl 部分（如果有）
  const pureUrl = url.replace(__VITE_SERVER_BASEURL__, '');
  const handler = mocks[pureUrl];
  return handler ? handler(data) : null;
};
