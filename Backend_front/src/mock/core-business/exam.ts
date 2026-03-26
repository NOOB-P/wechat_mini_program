export const mockExamList = [
  {
    id: 'e1',
    name: '高一期中考试',
    date: '2023-11-01',
    status: '已解析',
    successCount: 45,
    failCount: 5
  },
  {
    id: 'e2',
    name: '高一期末考试',
    date: '2024-01-15',
    status: '解析中',
    successCount: 0,
    failCount: 0
  }
];

export const mockAnalysisResult = {
  successList: Array.from({ length: 45 }).map((_, i) => ({
    studentNo: `202300${i + 1}`,
    name: `学生${i + 1}`,
    score: Math.floor(Math.random() * 40) + 60
  })),
  failList: Array.from({ length: 5 }).map((_, i) => ({
    studentNo: `999900${i + 1}`,
    reason: '学号不存在，未匹配到学生档案'
  }))
};
