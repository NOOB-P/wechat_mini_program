import { mockExamList } from '@/mock/core-business/exam'

export function fetchGetExamList(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      list: mockExamList,
      total: mockExamList.length
    }
  })
}
