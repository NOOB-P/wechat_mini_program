export const mockStudentList = Array.from({ length: 100 }).map((_, index) => ({
  id: `stu_${index + 1}`,
  name: `学生${index + 1}`,
  studentNo: `202300${(index + 1).toString().padStart(3, '0')}`,
  school: index < 40 ? '第一中学' : (index < 70 ? '第二中学' : '第三实验学校'),
  schoolId: 'SCH001',
  classId: 'CLS001',
  grade: index % 4 === 0 ? '高一年级' : (index % 4 === 1 ? '高二年级' : (index % 4 === 2 ? '初一年级' : '小学一年级')),
  className: `${(index % 5) + 1}班`,
  parentPhone: `13800138${index.toString().padStart(3, '0')}`,
  isBound: index % 3 !== 0
}));
