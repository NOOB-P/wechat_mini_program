import api from '@/utils/http';
export function fetchAnalysisClassSelect(projectId) {
    return api.get({
        url: '/api/system/exam-analysis/class-select',
        params: { projectId }
    });
}
//# sourceMappingURL=class-select.js.map