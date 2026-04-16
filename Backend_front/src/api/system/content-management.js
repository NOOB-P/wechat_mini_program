import api from '@/utils/http';
export async function fetchGetPermissionOptions() {
    return api.get({
        url: '/api/admin/content-management/options'
    });
}
export async function fetchGetRolePermissions(params) {
    return api.get({
        url: '/api/admin/content-management/roles',
        params
    });
}
export async function fetchUpdateRolePermissions(roleId, permissionCodes) {
    return api.post({
        url: '/api/admin/content-management/save',
        data: {
            roleId,
            permissionCodes
        }
    });
}
//# sourceMappingURL=content-management.js.map