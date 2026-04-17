import api from '@/utils/http';
import { useUserStore } from '@/store/modules/user';
export const getClassList = (params) => {
    return api.get({
        url: '/api/system/class/list',
        params
    });
};
export const getClassOptions = (schoolId) => {
    return api.get({
        url: '/api/system/class/options',
        params: { schoolId }
    });
};
export const addClass = (data) => {
    return api.post({
        url: '/api/system/class/add',
        data
    });
};
export const batchAddClasses = (data) => {
    return api.post({
        url: '/api/system/class/batch-add',
        data
    });
};
export const updateClass = (id, data) => {
    return api.put({
        url: `/api/system/class/update/${id}`,
        data
    });
};
export const deleteClass = (id) => {
    return api.del({
        url: `/api/system/class/delete/${id}`
    });
};
export const batchDeleteClasses = (ids) => {
    return api.post({
        url: '/api/system/class/batch-delete',
        data: { ids }
    });
};
export function fetchImportClass(file, schoolId) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post({
        url: '/api/system/class/import',
        params: {
            schoolId
        },
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
export function fetchDownloadClassTemplate() {
    const token = useUserStore().accessToken || '';
    const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}/api/system/class/download-template?token=${token}`, '_blank');
}
//# sourceMappingURL=index.js.map