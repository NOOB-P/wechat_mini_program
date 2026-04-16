import api from '@/utils/http';
export function fetchGetProjectList(params) {
    return api.get({
        url: '/api/system/exam-project/list',
        params
    });
}
export function fetchProjectOptions() {
    return api.get({
        url: '/api/system/exam-project/options'
    });
}
export function fetchProjectDetail(id) {
    return api.get({
        url: `/api/system/exam-project/detail/${id}`
    });
}
export function fetchAddProject(data) {
    return api.post({
        url: '/api/system/exam-project/add',
        data
    });
}
export function fetchUpdateProject(data) {
    return api.put({
        url: '/api/system/exam-project/edit',
        data
    });
}
export function fetchDeleteProject(id) {
    return api.del({
        url: `/api/system/exam-project/delete/${id}`
    });
}
//# sourceMappingURL=project.js.map