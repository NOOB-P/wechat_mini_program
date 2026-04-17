import api from '@/utils/http';
/**
 * FAQ 相关接口
 */
export function fetchGetFaqList(params) {
    return api.get({
        url: '/api/customer/faq/list',
        params
    });
}
export function fetchGetFaqCategories() {
    return api.get({
        url: '/api/customer/faq/categories'
    });
}
/**
 * FAQ 分类管理接口
 */
export function fetchAddFaqCategory(data) {
    return api.post({
        url: '/api/customer/faq/category/add',
        data
    });
}
export function fetchGetFaqCategoryList() {
    return api.get({
        url: '/api/customer/faq/category/list'
    });
}
export function fetchUpdateFaqCategory(data) {
    return api.put({
        url: `/api/customer/faq/category/edit/${data.id}`,
        data
    });
}
export function fetchDeleteFaqCategory(id) {
    return api.del({
        url: `/api/customer/faq/category/delete/${id}`
    });
}
export function fetchAddFaq(params) {
    return api.post({
        url: '/api/customer/faq/add',
        data: params
    });
}
export function fetchUpdateFaq(params) {
    return api.put({
        url: `/api/customer/faq/edit/${params.id}`,
        data: params
    });
}
export function fetchDeleteFaq(id) {
    return api.del({
        url: `/api/customer/faq/delete/${id}`
    });
}
/**
 * 微信配置相关接口 (多群管理)
 */
export function fetchGetWechatConfigList() {
    return api.get({
        url: '/api/customer/wechat/list'
    });
}
export function fetchAddWechatConfig(data) {
    return api.post({
        url: '/api/customer/wechat/add',
        data
    });
}
export function fetchUpdateWechatConfig(data) {
    return api.put({
        url: `/api/customer/wechat/edit/${data.id}`,
        data
    });
}
export function fetchDeleteWechatConfig(id) {
    return api.del({
        url: `/api/customer/wechat/delete/${id}`
    });
}
export function fetchUploadWechatQrCode(data) {
    return api.post({
        url: '/api/customer/wechat/upload',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
//# sourceMappingURL=index.js.map