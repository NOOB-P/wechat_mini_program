import api from '@/utils/http';
export function fetchAnalysisClassDashboard(params) {
    return api.get({
        url: '/api/system/exam-analysis/class-dashboard',
        params
    });
}
//# sourceMappingURL=class-dashboard.js.map