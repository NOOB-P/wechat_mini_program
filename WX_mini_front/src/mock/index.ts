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
    const { studentName, studentId, password, code, phone } = data;
    
    // 模拟绑定验证：假设特定的信息能成功
    if (studentName === '张三' && studentId === '123456' && password === '123456') {
      return {
        code: 200,
        msg: '绑定成功 (Mock)'
      };
    } else {
      return {
        code: 400,
        msg: '账号密码错误或学生不存在 (Mock)'
      };
    }
  },
  '/auth/forgot-account/find': (data) => {
    return {
      code: 200,
      msg: '查询成功，账号已通过短信发送 (Mock)'
    };
  },
  '/auth/forgot-password/verify-phone': (data) => {
    const { phone } = data;
    if (phone === '13800000000' || phone === '13588888888') {
      return {
        code: 200,
        msg: '验证通过 (Mock)'
      };
    }
    return {
      code: 400,
      msg: '该手机号未注册 (Mock)'
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
  },
  '/score/list': (data) => {
    return {
      code: 200,
      msg: '获取成绩成功 (Mock)',
      data: {
        examName: '2023-2024学年第一学期期中考试',
        examDate: '2023-11-15',
        totalScore: 620,
        totalLevel: 'A',
        subjects: [
          { name: '语文', score: 120, level: 'A', fullScore: 150 },
          { name: '数学', score: 135, level: 'A', fullScore: 150 },
          { name: '英语', score: 110, level: 'B', fullScore: 150 },
          { name: '物理', score: 85, level: 'B', fullScore: 100 },
          { name: '化学', score: 90, level: 'A', fullScore: 100 },
          { name: '生物', score: 80, level: 'B', fullScore: 100 }
        ],
        history: [
          { period: '一月', score: 580 },
          { period: '二月', score: 590 },
          { period: '三月', score: 620 },
          { period: '四月', score: 605 },
          { period: '五月', score: 650 }
        ]
      }
    };
  },
  '/paper/detail': (data) => {
    return {
      code: 200,
      msg: '获取试卷详情成功 (Mock)',
      data: {
        examName: '2023-2024学年第一学期期中考试 - 数学',
        score: 135,
        fullScore: 150,
        teacherComment: '本次考试基础题掌握得很好，但在最后一道压轴大题上计算出现了失误。继续保持，注意做题时的计算细节！',
        originalPaperImages: [
          'https://via.placeholder.com/600x800.png?text=Original+Paper+Page+1',
          'https://via.placeholder.com/600x800.png?text=Original+Paper+Page+2'
        ],
        electronicPaperImages: [
          'https://via.placeholder.com/600x800.png?text=Electronic+Paper+Page+1',
          'https://via.placeholder.com/600x800.png?text=Electronic+Paper+Page+2'
        ],
        answers: [
          { questionNo: '1', type: '选择题', studentAnswer: 'A', correctAnswer: 'A', isRight: true },
          { questionNo: '2', type: '选择题', studentAnswer: 'C', correctAnswer: 'B', isRight: false },
          { questionNo: '15', type: '解答题', studentAnswer: '见试卷原卷', correctAnswer: '参考答案详见电子版解析...', isRight: true }
        ],
        downloadUrl: 'https://example.com/download/paper.pdf'
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
