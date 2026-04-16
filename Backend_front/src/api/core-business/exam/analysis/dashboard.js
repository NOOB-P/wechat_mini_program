import api from '@/utils/http';
export function fetchAnalysisProjectDashboard(projectId) {
    return api.get({
        url: '/api/system/exam-analysis/project-dashboard',
        params: { projectId }
    });
}
//# sourceMappingURL=dashboard.js.map