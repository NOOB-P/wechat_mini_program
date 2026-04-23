import type { requestOptions } from '@/types/request'
import { getMockData } from '@/mock/index'

// 是否开启 mock (通常只在开发环境下开启)
const USE_MOCK = import.meta.env.DEV && String(import.meta.env.VITE_USE_MOCK).toLowerCase() === 'true'
const MOCK_BYPASS_URLS = [
    '/api/app/auth/sendCode',
    '/api/app/auth/login/phone',
    '/api/app/auth/login/wechat/bind-phone'
]
// 封装 toast 提示，兼容非组件环境
const showToast = (options: UniApp.ShowToastOptions) => {
    uni.showToast({
        ...options,
        icon: options.icon || 'none'
    })
}

const showLoading = (title: string) => {
    uni.showLoading({
        title,
        mask: true
    })
}

const hideLoading = () => {
    uni.hideLoading()
}

// 请求拦截
const requestInterceptor = (options: requestOptions) => {
    // 设置请求超时时间
    options.timeout = __VITE_SERVER_TIMEOUT__
    
    // 处理 params 参数，将其拼接在 URL 后面
    if (options.params) {
        const query = Object.keys(options.params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`)
            .join('&')
        if (query) {
            options.url += (options.url.includes('?') ? '&' : '?') + query
        }
    }

    // 拼接请求地址
    options.url = __VITE_SERVER_BASEURL__ + options.url
    console.log(options.url)
    // 设置请求头
    const token = uni.getStorageSync('token')
    options.header = {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json;charset=utf-8',
        ...options.header
    }
    return options
}

export default (options:requestOptions): Promise<any> => {
    // 移除了全局的 showLoading，避免页面加载时频繁闪烁
    
    // 如果开启 mock，则尝试拦截并返回模拟数据
    if (USE_MOCK && !MOCK_BYPASS_URLS.includes(options.url)) {
        const mockResponse = getMockData(options.url, options.data);
        if (mockResponse) {
            console.log('拦截到 Mock 数据:', mockResponse);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (mockResponse.code === 200) {
                        resolve(mockResponse);
                    } else {
                        reject(mockResponse);
                        if (!options.silent) {
                            showToast({ title: `Mock Error ${mockResponse.code}:${mockResponse.msg}` });
                        }
                    }
                }, 500); // 模拟网络延迟
            });
        }
    }

    options = requestInterceptor(options)
    return new Promise((resolve,reject) => {
        uni.request({
            ...options,
            success(res:UniApp.RequestSuccessCallbackResult) {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const errorMessage = typeof res.data === 'object' && res.data && 'msg' in res.data
                        ? String((res.data as any).msg)
                        : `HTTP ${res.statusCode}`
                    const errorResult = typeof res.data === 'object' && res.data
                        ? res.data
                        : { code: res.statusCode, msg: errorMessage, data: res.data }
                    reject(errorResult)
                    if (!options.silent) {
                        showToast({ title: errorMessage })
                    }
                    return
                }
                // 判断返回data是否为object，请求返回值可能不是object
                if(typeof res.data === 'object' && 'code' in res.data) {
                    if(res.data.code === 200) {
                        resolve(res.data)
                        // 彻底移除全局成功提示逻辑
                    } else {
                        reject(res.data)
                        if (!options.silent) {
                            showToast({ title: `Error ${res.data.code}:${res.data.msg}` })
                        }
                    }
                } else {
                    resolve(res.data)
                }
            },
            fail(error) {
                reject(error)
                if (!options.silent) {
                    showToast({ title: `Error: ${error.errMsg}` })
                }
            },
            complete() {}
        })
    })
}
