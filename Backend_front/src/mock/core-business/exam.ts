export const mockExamList = [
  {
    id: 'e1',
    name: '高一期中考试',
    school: '第一中学',
    grade: '高一年级',
    className: '1班',
    date: '2023-11-01',
    status: '已解析',
    successCount: 45,
    failCount: 5
  },
  {
    id: 'e2',
    name: '高一期末考试',
    school: '第一中学',
    grade: '高一年级',
    className: '2班',
    date: '2024-01-15',
    status: '解析中',
    successCount: 0,
    failCount: 0
  },
  {
    id: 'e3',
    name: '初一单元测试',
    school: '第二中学',
    grade: '初一年级',
    className: '3班',
    date: '2024-03-10',
    status: '已解析',
    successCount: 38,
    failCount: 2
  },
  {
    id: 'e4',
    name: '小学一年级摸底考试',
    school: '第三实验学校',
    grade: '小学一年级',
    className: '实验1班',
    date: '2024-03-20',
    status: '已解析',
    successCount: 25,
    failCount: 0
  },
  {
    id: 'e5',
    name: '高二月考',
    school: '第一中学',
    grade: '高二年级',
    className: '1班',
    date: '2024-03-25',
    status: '待解析',
    successCount: 0,
    failCount: 0
  }
];

export const mockAnalysisResult = {
  successList: Array.from({ length: 45 }).map((_, i) => {
    // 增加题目数量到 15 题，以测试横向滚动
    const qScores = Array.from({ length: 15 }).map(() => Math.floor(Math.random() * 5) + 5);
    const totalScore = qScores.reduce((sum, score) => sum + score, 0);
    return {
      studentNo: `202300${(i + 1).toString().padStart(3, '0')}`,
      name: `学生${i + 1}`,
      school: '第一中学',
      grade: '高一年级',
      className: '1班',
      questionScores: qScores,
      score: totalScore
    };
  }),
  failList: Array.from({ length: 5 }).map((_, i) => ({
    studentNo: `999900${i + 1}`,
    reason: '学号不存在，未匹配到学生档案'
  }))
};
