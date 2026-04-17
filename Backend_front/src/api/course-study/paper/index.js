import api from '@/utils/http';
export const getPaperListApi = (params) => {
    return api.get({
        url: '/api/admin/resource/paper/list',
        params
    });
};
export const savePaperApi = (data) => {
    return api.post({
        url: '/api/admin/resource/paper/save',
        data
    });
};
export const deletePaperApi = (id) => {
    return api.del({
        url: `/api/admin/resource/paper/delete/${id}`
    });
};
// 统计相关
export const getTypeStatsApi = () => {
    return api.get({
        url: '/api/admin/resource/paper/type/stats'
    });
};
export const getGradeStatsApi = (type) => {
    return api.get({
        url: '/api/admin/resource/paper/grade/stats',
        params: { type }
    });
};
export const getSubjectStatsApi = (type, grade) => {
    return api.get({
        url: '/api/admin/resource/paper/subject/stats',
        params: { type, grade }
    });
};
export const getSubjectsApi = () => {
    return api.get({
        url: '/api/admin/resource/paper/subjects'
    });
};
export const saveSubjectApi = (data) => {
    return api.post({
        url: '/api/admin/resource/paper/subject/save',
        data
    });
};
export const deleteSubjectApi = (id) => {
    return api.del({
        url: `/api/admin/resource/paper/subject/delete/${id}`
    });
};
export const uploadPaperApi = (data) => {
    return api.post({
        url: '/api/admin/resource/paper/upload',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
//# sourceMappingURL=index.js.map