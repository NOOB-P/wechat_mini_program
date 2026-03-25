import mineMocks from './mine/index';

export interface MockResponse {
  code: number;
  msg: string;
  data?: any;
}

const mocks: Record<string, (data: any) => MockResponse> = {
  ...mineMocks,
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
    return {
      code: 200,
      msg: `${type === 'wechat' ? '微信' : 'QQ'}登录成功 (Mock)`,
      data: {
        id: 99,
        phone: '138****8888',
        nickname: `${type === 'wechat' ? '微信' : 'QQ'}用户`,
        token: `mock-token-${type}-${openid}`
      }
    };
  }
};

export const getMockData = (url: string, data: any): MockResponse | null => {
  // 去掉 baseUrl 部分（如果有）
  const pureUrl = url.replace(__VITE_SERVER_BASEURL__, '');
  const handler = mocks[pureUrl];
  return handler ? handler(data) : null;
};
