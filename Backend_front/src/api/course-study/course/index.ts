import { mockCourseList } from '@/mock/course-study/course'

export function fetchGetCourseList(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      list: mockCourseList,
      total: mockCourseList.length
    }
  })
}

export function fetchAddCourse(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

export function fetchUpdateCourse(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

export function fetchDeleteCourse(id: string) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}

export function fetchChangeCourseStatus(id: string, status: number) {
  return Promise.resolve({
    code: 200,
    msg: status === 1 ? '上架成功' : '下架成功',
    data: null
  })
}
