import { mockStudentList } from '@/mock/core-business/student'

/** 获取学生列表 */
export function fetchGetStudentList(params: Api.Student.StudentSearchParams) {
  const { current = 1, size = 10, name, studentNo, school, grade, className } = params
  
  // 模拟搜索过滤
  let filteredList = [...mockStudentList]
  if (name) filteredList = filteredList.filter(item => item.name.includes(name))
  if (studentNo) filteredList = filteredList.filter(item => item.studentNo.includes(studentNo))
  if (school) filteredList = filteredList.filter(item => item.school === school)
  if (grade) filteredList = filteredList.filter(item => item.grade === grade)
  if (className) filteredList = filteredList.filter(item => item.className === className)

  const total = filteredList.length
  const start = (current - 1) * size
  const end = start + size
  const records = filteredList.slice(start, end)

  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      records,
      total,
      current,
      size
    }
  })
}

/** 新增学生 */
export function fetchAddStudent(params: Partial<Api.Student.StudentItem>) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

/** 更新学生 */
export function fetchUpdateStudent(params: Partial<Api.Student.StudentItem>) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

/** 删除学生 */
export function fetchDeleteStudent(id: string) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}

/** 批量开通 VIP/SVIP */
export function fetchBatchUpdateStatus(params: Api.Student.BatchOpParams) {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: null
  })
}

/** 导入学生 Excel */
export function fetchImportStudents(file: File) {
  return Promise.resolve({
    code: 200,
    msg: '导入成功',
    data: null
  })
}
