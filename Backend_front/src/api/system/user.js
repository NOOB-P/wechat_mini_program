import api from '@/utils/http';
import { useUserStore } from '@/store/modules/user';
/** 获取用户列表 */
export function fetchGetUserList(params) {
    // 对接真实后端接口
    return api.get({
        url: '/api/system/user/list',
        params
    });
}
/** 添加用户 */
export function fetchAddUser(data) {
    return api.post({
        url: '/api/system/user/add',
        data: {
            username: data.userName,
            nickname: data.nickName,
            phone: data.userPhone,
            email: data.email,
            roleId: data.userType,
            password: data.password
        }
    });
}
/** 编辑用户 */
export function fetchEditUser(id, data) {
    return api.put({
        url: `/api/system/user/edit/${id}`,
        data: {
            nickname: data.nickName,
            phone: data.userPhone,
            email: data.email,
            roleId: data.userType,
            password: data.password
        }
    });
}
/** 删除用户 */
export function fetchDeleteUser(id) {
    return api.del({
        url: `/api/system/user/delete/${id}`
    });
}
/** 批量导入家长 */
export function fetchImportParentUsers(data) {
    let finalData;
    if (data instanceof FormData) {
        finalData = data;
    }
    else {
        finalData = new FormData();
        finalData.append('file', data);
    }
    return api.post({
        url: '/api/system/user/import-parents',
        data: finalData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
/** 下载家长导入模板 */
export function fetchDownloadParentTemplate() {
    const token = useUserStore().accessToken || '';
    const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}/api/system/user/download-parent-template?token=${token}`, '_blank');
}
//# sourceMappingURL=user.js.map