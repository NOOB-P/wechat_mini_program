import api from '@/utils/http';
export function fetchAnalysisStudentReport(params) {
    return api.get({
        url: '/api/system/exam-analysis/student-report',
        params
    });
}
//# sourceMappingURL=student-report.js.map