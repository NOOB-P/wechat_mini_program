import { mockStudentList } from '@/mock/core-business/student'

export function fetchGetStudentList(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      list: mockStudentList,
      total: mockStudentList.length
    }
  })
}

export function fetchAddStudent(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

export function fetchUpdateStudent(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

export function fetchDeleteStudent(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}
