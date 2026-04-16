import api from '@/utils/http';
import { mockLoginData } from '@/mock/auth/login';
export async function fetchGetRoles() {
    return api.get({
        url: '/api/admin/auth/roles'
    });
}
export async function fetchLogin(params) {
    return api.post({
        url: '/api/admin/auth/login',
        data: {
            username: params.userName,
            password: params.password,
            roleId: params.roleId
        }
    });
}
export async function fetchUpdateBasicInfo(uid, data) {
    return api.put({
        url: `/api/auth/userInfo/${uid}`,
        data
    });
}
export async function fetchUpdatePassword(data) {
    return api.put({
        url: '/api/auth/password',
        data
    });
}
const mapRoleCodeToFrontendRoles = (roleCode) => {
    if (roleCode === 'super_admin')
        return ['R_SUPER'];
    if (roleCode === 'admin')
        return ['R_ADMIN'];
    if (roleCode === 'parent')
        return ['R_PARENT'];
    return ['R_USER'];
};
export async function fetchGetUserInfo() {
    const userInfo = await api.get({
        url: '/api/auth/info'
    });
    if (userInfo) {
        const permissions = Array.isArray(userInfo.permissions) ? userInfo.permissions : [];
        return {
            ...mockLoginData.admin.userInfo,
            userId: userInfo.uid,
            userName: userInfo.username,
            nickName: userInfo.nickname,
            phone: userInfo.phone,
            userPhone: userInfo.phone,
            email: userInfo.email,
            avatar: userInfo.avatar,
            roleCode: userInfo.roleCode,
            permissions,
            buttons: permissions,
            roles: mapRoleCodeToFrontendRoles(userInfo.roleCode)
        };
    }
    return {
        ...mockLoginData.admin.userInfo,
        permissions: Array.isArray(mockLoginData.admin.userInfo?.permissions)
            ? mockLoginData.admin.userInfo.permissions
            : [],
        buttons: Array.isArray(mockLoginData.admin.userInfo?.buttons)
            ? mockLoginData.admin.userInfo.buttons
            : []
    };
}
//# sourceMappingURL=login.js.map