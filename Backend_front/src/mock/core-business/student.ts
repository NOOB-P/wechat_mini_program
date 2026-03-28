export const mockStudentList = Array.from({ length: 50 }).map((_, index) => ({
  id: `stu_${index + 1}`,
  name: `学生${index + 1}`,
  studentNo: `202300${index + 1}`,
  gender: index % 2 === 0 ? '男' : '女',
  grade: index < 25 ? '高一年级' : '高二年级',
  className: index % 2 === 0 ? '1班' : '2班',
  parentPhone: `13800138${index.toString().padStart(3, '0')}`,
  isBound: index % 3 !== 0
}));
