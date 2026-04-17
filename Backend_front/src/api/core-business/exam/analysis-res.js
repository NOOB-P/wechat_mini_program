import { mockAnalysisResult } from '@/mock/core-business/exam';
export function fetchGetAnalysisResult(examId) {
    return Promise.resolve({
        code: 200,
        msg: '获取成功',
        data: mockAnalysisResult
    });
}
export function fetchBindStudent(data) {
    return Promise.resolve({
        code: 200,
        msg: '绑定成功',
        data: null
    });
}
//# sourceMappingURL=analysis-res.js.map