import type { requestOptions } from '@/types/request'

// 是否开启 mock (通常只在开发环境下开启)
const USE_MOCK = import.meta.env.DEV
const MOCK_BYPASS_URLS = [
    '/api/app/auth/sendCode',
    '/api/app/auth/login/phone',
    '/api/app/auth/login/wechat/bind-phone'
]

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
    options = requestInterceptor(options)
    return new Promise((resolve,reject) => {
        uni.request({
            ...options,
            success(res:UniApp.RequestSuccessCallbackResult) {
                // 判断返回data是否为object，请求返回值可能不是object
                if(typeof res.data === 'object' && 'code' in res.data) {
                    if(res.data.code === 200) {
                        resolve(res.data)
                    } else {
                        reject(res.data)
                        if (!options.silent) {
                            uni.showToast({ title: `Error ${res.data.code}:${res.data.msg}`, icon: 'none' })
                        }
                    }
                } else {
                    resolve(res.data)
                }
            },
            fail(error) {
                reject(error)
                if (!options.silent) {
                    uni.showToast({ title: `Error: ${error.errMsg}`, icon: 'none' })
                }
            },
            complete() {}
        })
    })
}
