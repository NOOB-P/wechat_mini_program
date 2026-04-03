import mineMocks from './mine/index';

export interface MockResponse {
  code: number;
  msg: string;
  data?: any;
}

const mocks: Record<string, (data: any) => MockResponse> = {
  ...mineMocks,
  /*
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
    if (password !== '123456') {
      return {
        code: 400,
        msg: '密码错误 (Mock)'
      };
    }
    
    const isSVIP = phone === '13688888888';
    const role = isSVIP ? 'svip' : 'vip';

    return {
      code: 200,
      msg: '登录成功 (Mock)',
      data: {
        id: 1,
        phone: phone,
        nickname: isSVIP ? 'SVIP尊贵家长' : '优题慧家长',
        token: `mock-token-${phone}`,
        role: role
      }
    };
  },
  '/login/phone': (data) => {
    const { phone, code } = data;
    if (code !== '114514') {
      return {
        code: 400,
        msg: '验证码错误 (Mock)'
      };
    }
    
    // 模拟特殊账号 SVIP
    const isSVIP = phone === '13688888888';
    const role = isSVIP ? 'svip' : 'vip'; // 默认当普通vip处理，根据需求可扩展

    return {
      code: 200,
      msg: '登录成功 (Mock)',
      data: {
        id: 1,
        phone: phone,
        nickname: isSVIP ? 'SVIP尊贵家长' : '优题慧家长',
        token: `mock-token-${phone}`,
        role: role
      }
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
  '/home/stats': () => {
    return {
      code: 200,
      msg: '获取统计数据成功 (Mock)',
      data: {
        paperCount: 12,
        wrongCount: 56,
        analysisProgress: 80
      }
    };
  },
  '/home/banners': () => {
    return {
      code: 200,
      msg: '获取轮播图成功 (Mock)',
      data: [
        { id: 1, name: '心理健康微课堂', desc: '解读青春期烦恼，走进孩子内心世界', image: 'https://img.yzcdn.cn/vant/cat.jpeg', isPublic: true },
        { id: 2, name: '家长必修课', desc: '如何构建和谐的亲子沟通桥梁', image: 'https://img.yzcdn.cn/vant/cat.jpeg', isPublic: true }
      ]
    };
  },
  '/home/publicCourses': () => {
    return {
      code: 200,
      msg: '获取公益课程成功 (Mock)',
      data: [
        { id: 1, name: '高中数学压轴', iconClass: 'math', iconText: '数', isPublic: true },
        { id: 2, name: '外教口语特训', iconClass: 'eng', iconText: '英', isPublic: true },
        { id: 3, name: '力学实验全解', iconClass: 'phy', iconText: '物', isPublic: true }
      ]
    };
  },
  '/home/recommend': () => {
    return {
      code: 200,
      msg: '获取推荐课程成功 (Mock)',
      data: [
        { id: 1, name: '数学强化班', price: 199, image: 'https://img.yzcdn.cn/vant/ipad.jpeg' },
        { id: 2, name: '英语口语课', price: 299, image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        { id: 3, name: '物理实验课', price: 150, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
        { id: 4, name: '化学奥赛', price: 399, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' }
      ]
    };
  },
  */
  /*
  '/course/list': (data) => {
    return {
      code: 200,
      msg: '获取课程列表成功 (Mock)',
      data: [
        { id: 1, name: '数学基础', desc: '适合初学者', price: 99, image: 'https://img.yzcdn.cn/vant/ipad.jpeg' },
        { id: 2, name: '英语语法', desc: '精讲常用语法', price: 129, image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        { id: 3, name: '物理力学', desc: '力学基础知识', price: 149, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
        { id: 4, name: '化学反应', desc: '带你了解化学世界', price: 199, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' }
      ]
    };
  },
  */
  '/api/app/score/semester/list': (data) => {
    return {
      code: 200,
      msg: '获取学期考试列表成功 (Mock)',
      data: {
        semesters: [
          { label: '2023-2024学年 第二学期', value: '2023-2024-2' },
          { label: '2023-2024学年 第一学期', value: '2023-2024-1' }
        ],
        semesterData: {
          '2023-2024-2': [
            { label: '期末考试', value: 'final' },
            { label: '六月模拟', value: 'mock2' },
            { label: '五月月考', value: 'month3' },
            { label: '期中考试', value: 'midterm' },
            { label: '三月月考', value: 'month1' },
            { label: '开学考', value: 'start' }
          ],
          '2023-2024-1': [
            { label: '期末考试', value: 'final' },
            { label: '五月模拟', value: 'mock1' },
            { label: '四月模拟', value: 'mock2' },
            { label: '三月月考', value: 'month2' },
            { label: '期中考试', value: 'midterm' },
            { label: '一月月考', value: 'month1' }
          ]
        }
      }
    }
  },
  '/api/app/score/list': (data) => {
    // 模拟根据不同学期和考试返回不同数据
    const isNextSemester = data?.semester === '2023-2024-2';
    const examId = data?.examId || 'final';
    
    // 基础分数池，根据 examId 微调
    let baseScoreModifier = 0;
    let examNameStr = '';
    
    if (examId === 'final') { baseScoreModifier = 0; examNameStr = '期末考试'; }
    else if (examId === 'midterm') { baseScoreModifier = -15; examNameStr = '期中考试'; }
    else if (examId.includes('mock')) { baseScoreModifier = -5; examNameStr = '模拟考试'; }
    else { baseScoreModifier = -25; examNameStr = '月考'; }

    // 固定的近6次考试历史记录（用于图表对比）
    const historyNext = [
      { period: '开学考', score: 610, subjects: { '语文': 115, '数学': 130, '英语': 110, '物理': 85, '化学': 85, '生物': 85 } },
      { period: '三月月考', score: 630, subjects: { '语文': 118, '数学': 132, '英语': 115, '物理': 88, '化学': 88, '生物': 89 } },
      { period: '期中考试', score: 650, subjects: { '语文': 120, '数学': 135, '英语': 120, '物理': 90, '化学': 92, '生物': 93 } },
      { period: '五月月考', score: 645, subjects: { '语文': 119, '数学': 138, '英语': 118, '物理': 89, '化学': 90, '生物': 91 } },
      { period: '六月模拟', score: 670, subjects: { '语文': 122, '数学': 140, '英语': 125, '物理': 93, '化学': 95, '生物': 95 } },
      { period: '期末考试', score: 680, subjects: { '语文': 125, '数学': 140, '英语': 130, '物理': 95, '化学': 95, '生物': 95 } }
    ];
    
    const historyPrev = [
      { period: '一月月考', score: 580, subjects: { '语文': 110, '数学': 120, '英语': 100, '物理': 80, '化学': 85, '生物': 85 } },
      { period: '期中考试', score: 620, subjects: { '语文': 120, '数学': 135, '英语': 110, '物理': 85, '化学': 90, '生物': 80 } },
      { period: '三月月考', score: 590, subjects: { '语文': 115, '数学': 125, '英语': 105, '物理': 82, '化学': 86, '生物': 77 } },
      { period: '四月模拟', score: 605, subjects: { '语文': 118, '数学': 130, '英语': 108, '物理': 84, '化学': 88, '生物': 77 } },
      { period: '五月模拟', score: 650, subjects: { '语文': 125, '数学': 138, '英语': 115, '物理': 90, '化学': 92, '生物': 90 } },
      { period: '期末考试', score: 680, subjects: { '语文': 128, '数学': 145, '英语': 120, '物理': 95, '化学': 96, '生物': 96 } }
    ];

    return {
      code: 200,
      msg: '获取成绩成功 (Mock)',
      data: {
        examName: (isNextSemester ? '2023-2024学年第二学期' : '2023-2024学年第一学期') + ' ' + examNameStr,
        examDate: isNextSemester ? '2024-06-15' : '2023-11-15',
        totalScore: (isNextSemester ? 680 : 620) + baseScoreModifier,
        totalLevel: (isNextSemester ? 680 : 620) + baseScoreModifier > 640 ? 'A+' : 'A',
        subjects: isNextSemester ? [
          { name: '语文', score: 125 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 150 },
          { name: '数学', score: 140 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 150 },
          { name: '英语', score: 130 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 150 },
          { name: '物理', score: 95 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 100 },
          { name: '化学', score: 95 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 100 },
          { name: '生物', score: 95 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 100 }
        ] : [
          { name: '语文', score: 120 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 150 },
          { name: '数学', score: 135 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 150 },
          { name: '英语', score: 110 + Math.floor(baseScoreModifier/6), level: 'B', fullScore: 150 },
          { name: '物理', score: 85 + Math.floor(baseScoreModifier/6), level: 'B', fullScore: 100 },
          { name: '化学', score: 90 + Math.floor(baseScoreModifier/6), level: 'A', fullScore: 100 },
          { name: '生物', score: 80 + Math.floor(baseScoreModifier/6), level: 'B', fullScore: 100 }
        ],
        history: isNextSemester ? historyNext : historyPrev
      }
    };
  },
  '/api/app/paper/detail': (data) => {
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
          { questionNo: '3', type: '填空题', studentAnswer: '15', correctAnswer: '15', isRight: true },
          { questionNo: '15', type: '解答题', studentAnswer: '见试卷原卷', correctAnswer: '参考答案详见电子版解析...', isRight: true }
        ],
        downloadUrl: 'https://example.com/download/paper.pdf'
      }
    };
  },
  /*
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
  },
  '/vip/analysis': (data) => {
    return {
      code: 200,
      msg: '获取VIP数据分析成功 (Mock)',
      data: {
        composition: [
          { name: '基础题', value: 60, level: 'A' },
          { name: '综合题', value: 25, level: 'B' },
          { name: '难题', value: 15, level: 'C' }
        ],
        distribution: {
          rankInfo: '班级前30%',
          overallLevel: 'B',
          levels: [
            { level: 'A', count: 5 },
            { level: 'B', count: 12 },
            { level: 'C', count: 18 },
            { level: 'D', count: 8 },
            { level: 'E', count: 2 }
          ]
        },
        trend: [
          { date: '第一周', score: 85 },
          { date: '第二周', score: 88 },
          { date: '第三周', score: 82 },
          { date: '第四周', score: 90 },
          { date: '第五周', score: 92 }
        ],
        habit: {
          suggestion: '自律性表现优异，但在难题攻坚上需要多花些时间，建议加强课后复习。',
          radarData: [
            { indicator: '完成率', value: 90 },
            { indicator: '正确率', value: 85 },
            { indicator: '及时性', value: 95 },
            { indicator: '专注度', value: 80 },
            { indicator: '自律性', value: 88 }
          ]
        }
      }
    };
  },
  '/vip/wrongbook/list': (data) => {
    return {
      code: 200,
      msg: '获取VIP错题本成功 (Mock)',
      data: [
        { id: 1, subject: '数学', time: '2023-11-20', question: '已知函数 f(x) = x^2 - 2x，求最小值。', studentAnswer: '0', correctAnswer: '-1', explanation: '顶点坐标公式 x=-b/2a=1，代入得 f(1)=1-2=-1。', tags: ['易错', '函数'] },
        { id: 2, subject: '物理', time: '2023-11-21', question: '自由落体运动中，下落高度h与时间t的关系？', studentAnswer: 'h=gt', correctAnswer: 'h=1/2gt^2', explanation: '基础公式记忆错误。', tags: ['基础', '运动学'] }
      ]
    };
  },
  '/vip/print/order': (data) => {
    return {
      code: 200,
      msg: '打印订单提交成功，请等待快递配送 (Mock)'
    };
  },
  '/vip/print/config': (data) => {
    return {
      code: 200,
      msg: '获取打印配置成功 (Mock)',
      data: {
        paperConfigs: [
          { size: 'A4', side: '单面', color: '黑白', price: 0.20 },
          { size: 'A4', side: '双面', color: '黑白', price: 0.35 },
          { size: 'A4', side: '单面', color: '彩色', price: 1.00 },
          { size: 'A4', side: '双面', color: '彩色', price: 1.80 },
          { size: 'A3', side: '单面', color: '黑白', price: 0.50 }
        ],
        globalParams: {
          minAmount: 5.00,
          bindingFee: 2.00
        },
        deliveryConfigs: [
          { method: 'standard', name: '标准快递', baseFee: 8.00, freeThreshold: 50.00, desc: '普通快递配送，预计2-3天送达' },
          { method: 'express', name: '极速达', baseFee: 15.00, freeThreshold: 100.00, desc: '顺丰特快，预计次日送达' },
          { method: 'pickup', name: '自提', baseFee: 0.00, freeThreshold: 0.00, desc: '学校指定地点自提' }
        ]
      }
    };
  },
  */
  /*
  '/resource/student-talk/list': () => ({
    code: 200,
    msg: 'success',
    data: [
      { id: 1, title: '学霸说09期 总有那么几个瞬间想放弃', author: '学霸说', buyers: 1434, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/cat.jpeg' },
      { id: 2, title: '学霸说08期 网络与学习的平衡之道', author: '学霸说', buyers: 556, episodes: 2, price: '免费', cover: 'https://img.yzcdn.cn/vant/ipad.jpeg' },
      { id: 3, title: '学霸说07期 学习与娱乐如何共处', author: '学霸说', buyers: 619, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 4, title: '学霸说06期 新学期新环境的相处', author: '学霸说', buyers: 152, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
    ]
  }),
  */
  /*
  '/resource/family-edu/list': () => ({
    code: 200,
    msg: 'success',
    data: [
      { id: 1, title: '如何平衡学业和兴趣', author: '家长课', buyers: 43, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/ipad.jpeg' },
      { id: 2, title: '如何提高孩子的注意力', author: '家长课', buyers: 61, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 3, title: '如何解救孩子沉迷游戏', author: '家长课', buyers: 606, episodes: 1, price: '免费', cover: 'https://img.yzcdn.cn/vant/cat.jpeg' },
      { id: 4, title: '期中备考大全，家长你Get了吗', author: '家长课', buyers: 57, episodes: 2, price: '免费', cover: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
    ]
  }),
  '/resource/sync-course/list': (data) => {
    const subject = data?.subject || '语文'
    return {
      code: 200,
      msg: 'success',
      data: [
        { id: 1, subject, title: `八年级上册${subject}同步课程`, episodes: 40, cover: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
        { id: 2, subject, title: `八年级下册${subject}同步课程`, episodes: 34, cover: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      ]
    }
  },
  */
  '/api/app/resource/paper/list': (data) => {
    const kw = data?.keyword || ''
    return {
      code: 200,
      msg: '获取试卷列表成功 (Mock)',
      data: [
        { id: 'P001', title: `2023年杭州二中高三仿真模拟卷 (一) ${kw}`, tags: ['名校', '重点', kw || '综合', 'PDF'], year: '2023年', grade: '高三', downloads: 1250 },
        { id: 'P002', title: `2024年北京人大附中初三二模真题 ${kw}`, tags: ['真题', '必刷', kw || '全科', '解析'], year: '2024年', grade: '初三', downloads: 3400 },
        { id: 'P003', title: `上海中学2023-2024学年高一期末考试卷 ${kw}`, tags: ['名校', '期末', kw || '数学', '精品'], year: '2024年', grade: '高一', downloads: 890 },
        { id: 'P004', title: `2023年西安西工大附中初一入学摸底测试 ${kw}`, tags: ['摸底', kw || '语文', 'PDF版'], year: '2023年', grade: '初一', downloads: 2100 },
        { id: 'P005', title: `2024年成都七中高二联考物理压轴卷 ${kw}`, tags: ['联考', '名校', kw || '物理', '解析'], year: '2024年', grade: '高二', downloads: 1560 }
      ]
    };
  },
  '/api/app/resource/paper/subjects': () => {
    return {
      code: 200,
      msg: '获取试卷科目成功 (Mock)',
      data: [
        { name: '语文', icon: 'read', color: '#ff5252' },
        { name: '数学', icon: 'chart', color: '#4caf50' },
        { name: '英语', icon: 'edit', color: '#2196f3' },
        { name: '物理', icon: 'setting', color: '#00bcd4' },
        { name: '化学', icon: 'filter', color: '#ff9800' },
        { name: '生物', icon: 'share', color: '#3f51b5' }
      ]
    };
  },
  /*
  '/resource/sync-course/options': () => {
    return {
      code: 200,
      msg: '获取同步辅导选项成功 (Mock)',
      data: {
        grades: ['七年级', '八年级', '九年级'],
        subjects: ['语文', '数学', '英语', '物理', '生物', '道德与法治', '历史']
      }
    };
  },
  */
  /*
  '/user/info': (data) => {
    // 根据请求头中的 token 区分角色
    const token = uni.getStorageSync('token') || '';
    const isSVIP = token.includes('13688888888');
    const isVIP = token.includes('13588888888') || token.includes('13800000000');
    
    let role = 'normal';
    let roleName = '普通用户';
    if (isSVIP) {
      role = 'svip';
      roleName = 'SVIP会员';
    } else if (isVIP) {
      role = 'vip';
      roleName = 'VIP会员';
    }

    return {
      code: 200,
      msg: '获取成功 (Mock)',
      data: {
        id: 1,
        nickname: isSVIP ? 'SVIP尊贵家长' : 'zxp114...',
        avatar: 'https://via.placeholder.com/150',
        phone: isSVIP ? '13688888888' : '138****8888',
        grade: '七年级',
        role: role,
        roleName: roleName
      }
    };
  }
  */
};

export const getMockData = (url: string, data: any): MockResponse | null => {
  // 去掉 baseUrl 部分（如果有）
  const pureUrl = url.replace(__VITE_SERVER_BASEURL__, '');

  /*
  // 课程详情 mock 拦截
  if (pureUrl === '/course/detail') {
    const detailData = getCourseDetailData(data?.name || '');
    return {
      code: 200,
      msg: '获取课程详情成功',
      data: detailData
    };
  }
  */

  const handler = mocks[pureUrl];
  return handler ? handler(data) : null;
};

/*
// --- 课程详情相关 ---
export const getCourseDetailData = (courseName: string) => {
...
  return {
    desc: '这是一门精心打磨的高质量课程，由资深名师亲自授课，深入浅出地剖析核心知识点。无论你是基础薄弱想要稳扎稳打，还是寻求突破冲击高分，这门课程都能为你提供针对性的指导与帮助。',
    studentCount: Math.floor(Math.random() * 1000) + 100,
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    chapters: chapterLists[courseName] || defaultChapters
  }
}
*/
