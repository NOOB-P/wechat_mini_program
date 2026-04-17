import api from '@/utils/http';
/** 获取班级列表 */
export function fetchGetClassList(params) {
    return api.get({
        url: '/api/system/exam-class/list',
        params
    });
}
/** 新增班级 */
export function fetchAddClass(data) {
    return api.post({
        url: '/api/system/exam-class/add',
        data
    });
}
/** 更新班级 */
export function fetchUpdateClass(data) {
    return api.put({
        url: '/api/system/exam-class/edit',
        data
    });
}
/** 删除班级 */
export function fetchDeleteClass(id) {
    return api.del({
        url: `/api/system/exam-class/delete/${id}`
    });
}
//# sourceMappingURL=class.js.map