import { mockSchoolTree } from '@/mock/core-business/school'

export function fetchGetSchoolTree() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockSchoolTree
  })
}

export function fetchAddClass(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}
