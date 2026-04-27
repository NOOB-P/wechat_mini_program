import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  minWidth: 1200,
  applications: [
    {
      name: '数据统计',
      description: '全站数据总览与分析',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'Analysis'
    },
    {
      name: '学校架构',
      description: '管理多级学校组织架构',
      icon: 'ri:building-4-line',
      iconColor: '#ff9500',
      enabled: true,
      order: 2,
      routeName: 'SchoolOrg'
    },
    {
      name: '学生档案',
      description: '学生档案与 VIP 状态管理',
      icon: 'ri:user-star-line',
      iconColor: '#5856d6',
      enabled: true,
      order: 3,
      routeName: 'StudentProfile'
    },
    {
      name: '考试中心',
      description: '考试数据与详细得分分析',
      icon: 'ri:file-list-3-line',
      iconColor: '#ff2d55',
      enabled: true,
      order: 4,
      routeName: 'ExamHub'
    },
    {
      name: '会员套餐',
      description: '配置 VIP/SVIP 价格与权益',
      icon: 'ri:vip-crown-line',
      iconColor: '#f9d423',
      enabled: true,
      order: 4.5,
      routeName: 'VipPackageManage'
    },
    {
      name: '打印价格',
      description: '配置纸张单价与配送费用',
      icon: 'ri:printer-line',
      iconColor: '#5ac8fa',
      enabled: true,
      order: 4.6,
      routeName: 'PrintPriceManage'
    },
    {
      name: '订单管理',
      description: '查看 VIP 与打印订单详情',
      icon: 'ri:bill-line',
      iconColor: '#ffb100',
      enabled: true,
      order: 4.7,
      routeName: 'VipOrderManage'
    },
    {
      name: '课程管理',
      description: '统一管理普通课程与 SVIP 课程',
      icon: 'ri:medal-line',
      iconColor: '#4cd964',
      enabled: true,
      order: 5,
      routeName: 'CourseManage'
    },
    {
      name: 'FAQ 管理',
      description: '常见问题解答配置',
      icon: 'ri:question-answer-line',
      iconColor: '#007aff',
      enabled: true,
      order: 7,
      routeName: 'FaqManage'
    },
    {
      name: '企业微信客服',
      description: '企微客服入口与展示位置管理',
      icon: 'ri:wechat-line',
      iconColor: '#07c160',
      enabled: true,
      order: 8,
      routeName: 'WechatConfig'
    },
    {
      name: '用户管理',
      description: '系统用户账号与权限',
      icon: 'ri:group-line',
      iconColor: '#af52de',
      enabled: true,
      order: 9,
      routeName: 'User'
    },
    {
      name: '日志管理',
      description: '系统操作日志记录',
      icon: 'ri:file-list-2-line',
      iconColor: '#8e8e93',
      enabled: true,
      order: 10,
      routeName: 'Log'
    }
  ],
  quickLinks: []
}

export default Object.freeze(fastEnterConfig)
