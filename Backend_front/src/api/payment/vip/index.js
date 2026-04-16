import api from '@/utils/http';
/**
 * 获取会员套餐列表
 */
export async function fetchVipPackages() {
    return api.get({
        url: '/api/vip/admin/list'
    });
}
/**
 * 更新套餐信息 (权益等)
 */
export async function updateVipPackage(data) {
    return api.post({
        url: '/api/vip/admin/update-config',
        data
    });
}
/**
 * 更新套餐价格
 */
export async function updatePackagePrice(data) {
    return api.post({
        url: '/api/vip/admin/update-pricing',
        data
    });
}
/**
 * 切换启用状态
 */
export async function toggleVipStatus(id, isEnabled) {
    return api.post({
        url: '/api/vip/admin/toggle-status',
        data: { id, isEnabled }
    });
}
//# sourceMappingURL=index.js.map