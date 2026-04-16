export const mockVipPackages = [
    {
        id: 1,
        name: 'VIP 基础版',
        type: 'VIP',
        description: '适合个人学习，包含基础题库与分析功能',
        features: ['基础题库访问', '错题本功能', '月度学习报告'],
        status: 1, // 1: 启用, 0: 禁用
        prices: [
            { id: 101, period: 'month', periodName: '月包', price: 29.00, originalPrice: 39.00 },
            { id: 102, period: 'semester', periodName: '季包(一学期)', price: 99.00, originalPrice: 129.00 },
            { id: 103, period: 'year', periodName: '年包', price: 299.00, originalPrice: 399.00 }
        ],
        createTime: '2024-01-01 10:00:00'
    },
    {
        id: 2,
        name: 'SVIP 专业版',
        type: 'SVIP',
        description: '全能学习助手，解锁所有高级分析与名师课程',
        features: ['全站题库无限访问', 'AI 智能解析', '名师精讲视频', '专属客服优先响应'],
        status: 1,
        prices: [
            { id: 201, period: 'month', periodName: '月包', price: 59.00, originalPrice: 79.00 },
            { id: 202, period: 'semester', periodName: '季包(一学期)', price: 199.00, originalPrice: 249.00 },
            { id: 203, period: 'year', periodName: '年包', price: 599.00, originalPrice: 799.00 }
        ],
        createTime: '2024-01-01 10:30:00'
    }
];
//# sourceMappingURL=index.js.map