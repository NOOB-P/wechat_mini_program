import type { requestOptions } from '@/types/request'
import { useNotify } from '@/components/GlobalNotify/index'

const Notify = useNotify()

// 请求拦截
const requestInterceptor = (options: requestOptions) => {
    // 设置请求超时时间
    options.timeout = __VITE_SERVER_TIMEOUT__
    // 拼接请求地址
    options.url = __VITE_SERVER_BASEURL__ + options.url
    // 设置请求头
    options.header = {
        Authorization: `Bearer `, // token
        'Content-Type': 'application/json;charset=utf-8',
        ...options.header
    }
    return options
}

export default (options:requestOptions): Promise<any> => {
    Notify.show({
        content: '加载中...',
        duration: false,
        icon: 'loading'
    })
    options = requestInterceptor(options)
    return new Promise((resolve,reject) => {
        uni.request({
            ...options,
            success(res:UniApp.RequestSuccessCallbackResult) {
                // 判断返回data是否为object，请求返回值可能不是object
                if(typeof res.data === 'object' && 'code' in res.data) {
                    if(res.data.code === 200) {
                        resolve(res.data)
                        Notify.show({
                            content: res.data.message,
                            duration: 500,
                            type: 'success',
                            icon: 'check-outline'
                        })
                    } else {
                        reject(res.data)
                        Notify.show({
                            content: `Error ${res.data.code}:${res.data.message}`,
                            duration: 2000,
                            type: 'danger',
                            icon: 'close-outline'
                        })
                    }
                } else {
                    resolve(res.data)
                    Notify.show({
                        content: '请求成功',
                        duration: 500,
                        type: 'success',
                        icon: 'check-outline'
                    })
                }
            },
            fail(error) {
                reject(error)
                Notify.show({
                    content: `Error: ${error.errMsg}`,
                    duration: 2000,
                    type: 'danger',
                    icon: 'close-outline'
                })
            },
            complete() {}
        })
    })
}
