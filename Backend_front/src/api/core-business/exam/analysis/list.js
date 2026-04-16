import api from '@/utils/http';
export function fetchAnalysisProjects(params) {
    return api.get({
        url: '/api/system/exam-analysis/projects',
        params
    });
}
//# sourceMappingURL=list.js.map