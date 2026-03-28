// 仪表盘分析数据 Mock
export const mockAnalysisData = {
  // 核心指标数据
  stats: [
    { title: '平台总注册用户', value: 12580, unit: '人', trend: 'up', percentage: '12%', icon: 'User' },
    { title: '今日活跃家长', value: 2456, unit: '人', trend: 'up', percentage: '8%', icon: 'House' },
    { title: 'VIP/SVIP 开通比例', value: 35.8, unit: '%', trend: 'down', percentage: '2%', icon: 'Star' },
    { title: '学生绑定率', value: 88.5, unit: '%', trend: 'up', percentage: '5%', icon: 'Link' }
  ],
  // 系统监控数据
  systemMonitor: {
    taskQueue: {
      total: 156,
      processing: 3,
      waiting: 12,
      completed: 141
    },
    storage: {
      used: 456, // GB
      total: 1024, // GB
      percentage: 44.5
    }
  },
  // 近30天用户增长趋势
  userGrowthTrend: {
    dates: Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    values: Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 200) + 100)
  },
  // 用户分布（VIP vs 普通）
  userDistribution: [
    { value: 4500, name: 'VIP用户' },
    { value: 1200, name: 'SVIP用户' },
    { value: 6880, name: '普通用户' }
  ]
};
