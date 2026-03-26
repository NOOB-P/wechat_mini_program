import { mockAnalysisResult } from '@/mock/core-business/exam'

export function fetchGetAnalysisResult(examId: string) {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockAnalysisResult
  })
}

export function fetchBindStudent(data: any) {
  return Promise.resolve({
    code: 200,
    msg: '绑定成功',
    data: null
  })
}
