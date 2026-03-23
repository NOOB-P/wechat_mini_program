import { getNeedLoginPages } from './page'
// 登录页
const LoginPageUrl = '/pages/login/index'

/**
 * @Description: 路由拦截
 */
const navigateToInterceptor = {
    invoke({ url }: { url: string }) {
        // 截掉路由携带的参数
        const path = url.split('?')[0]
        // 判断页面是否需要登录
        const needLoginPage = getNeedLoginPages().map(p => p.path)
        if(!needLoginPage.includes(path)) {
            return true
        }

        // 判断登录逻辑

        // 跳转到登录页
        const redirectRoute = `${LoginPageUrl}?redirect=${encodeURIComponent(url)}`
        uni.navigateTo({ url: redirectRoute })
        return false
    }
}

export const routeInterceptor = {
    install() {
      uni.addInterceptor('navigateTo', navigateToInterceptor)
      uni.addInterceptor('reLaunch', navigateToInterceptor)
      uni.addInterceptor('redirectTo', navigateToInterceptor)
    },
}