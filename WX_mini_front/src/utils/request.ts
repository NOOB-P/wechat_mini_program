import type { requestOptions } from '@/types/request'
import { useNotify } from '@/components/GlobalNotify/useNotify'
import { getMockData } from '@/mock/index'

const Notify = useNotify()

// 是否开启 mock (通常只在开发环境下开启)
const USE_MOCK = process.env.NODE_ENV === 'development'

// 请求拦截
const requestInterceptor = (options: requestOptions) => {
    // 设置请求超时时间
    options.timeout = __VITE_SERVER_TIMEOUT__
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
    Notify.show({
        content: '加载中...',
        duration: false,
        icon: 'loading'
    })
    
    // 如果开启 mock，则尝试拦截并返回模拟数据
    if (USE_MOCK) {
        const mockResponse = getMockData(options.url, options.data);
        if (mockResponse) {
            console.log('拦截到 Mock 数据:', mockResponse);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (mockResponse.code === 200) {
                        resolve(mockResponse);
                        Notify.show({
                            content: mockResponse.msg,
                            duration: 500,
                            type: 'success',
                            icon: 'check-outline'
                        });
                    } else {
                        reject(mockResponse);
                        Notify.show({
                            content: `Mock Error ${mockResponse.code}:${mockResponse.msg}`,
                            duration: 2000,
                            type: 'danger',
                            icon: 'close-outline'
                        });
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
                // 判断返回data是否为object，请求返回值可能不是object
                if(typeof res.data === 'object' && 'code' in res.data) {
                    if(res.data.code === 200) {
                        resolve(res.data)
                        Notify.show({
                            content: res.data.msg,
                            duration: 500,
                            type: 'success',
                            icon: 'check-outline'
                        })
                    } else {
                        reject(res.data)
                        Notify.show({
                            content: `Error ${res.data.code}:${res.data.msg}`,
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
