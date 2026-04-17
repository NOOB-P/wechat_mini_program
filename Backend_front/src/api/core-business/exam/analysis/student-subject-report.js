import api from '@/utils/http';
export function fetchAnalysisStudentSubjectReport(params) {
    return api.get({
        url: '/api/system/exam-analysis/student-subject-report',
        params
    });
}
//# sourceMappingURL=student-subject-report.js.map