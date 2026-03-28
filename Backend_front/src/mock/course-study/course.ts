export const mockCourseList = [
  {
    id: 'c1',
    title: '高效学习方法讲座',
    cover: 'https://www.qiniu.lingchen.kim/github-c1.webp',
    status: 1, // 1: 上架, 0: 下架
    videoUrl: 'https://example.com/video1.mp4',
    content: '<h1>高效学习方法</h1><p>这里是课程详细内容...</p>',
    createTime: '2024-03-20 10:00:00'
  },
  {
    id: 'c2',
    title: '家长教育心理学',
    cover: 'https://www.qiniu.lingchen.kim/github-c2.webp',
    status: 0,
    videoUrl: 'https://example.com/video2.mp4',
    content: '<h1>家长教育心理学</h1><p>这里是课程详细内容...</p>',
    createTime: '2024-03-21 14:30:00'
  }
];

export const mockStudyRoomList = [
  {
    id: 's1',
    parentName: '张三家长',
    studentName: '张小三',
    phone: '13800138001',
    status: 'pending', // pending: 待处理, confirmed: 已确认, rejected: 已拒绝
    applyTime: '2024-03-25 09:00:00',
    remark: '希望能安排在靠窗的位置'
  },
  {
    id: 's2',
    parentName: '李四家长',
    studentName: '李小四',
    phone: '13800138002',
    status: 'confirmed',
    applyTime: '2024-03-25 10:30:00',
    remark: ''
  },
  {
    id: 's3',
    parentName: '王五家长',
    studentName: '王小五',
    phone: '13800138003',
    status: 'rejected',
    applyTime: '2024-03-25 11:15:00',
    remark: '人满了'
  }
];
