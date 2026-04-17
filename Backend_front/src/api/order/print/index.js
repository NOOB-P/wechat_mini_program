import api from '@/utils/http';
/**
 * 获取打印订单列表
 * @param params 查询参数
 */
export function fetchPrintOrderList(params) {
    return api.get({
        url: '/api/admin/order/print/list',
        params
    });
}
/**
 * 获取打印订单详情
 * @param id 订单ID
 */
export function fetchPrintOrderDetail(id) {
    return api.get({
        url: `/api/admin/order/print/${id}`
    });
}
/**
 * 更新打印订单状态
 * @param id 订单ID
 * @param status 状态值
 */
export function updatePrintOrderStatus(id, status) {
    return api.put({
        url: `/api/admin/order/print/${id}/status`,
        data: { status }
    });
}
//# sourceMappingURL=index.js.map