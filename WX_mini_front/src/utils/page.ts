import { pages, subPackages, tabBar } from '@/pages.json'
import type {
    PageMetaDatum,
    SubPageMetaDatum
} from "@uni-helper/vite-plugin-uni-pages";

/**
 * @Description: 获取所有页面
 */
export const getAllPages = ():PageMetaDatum[] => {
    // 获取主包所有页面
    const main = pages.map((p:PageMetaDatum) => ({
        ...p,
        path: `/${p.path}`
    }))
    let sub:PageMetaDatum[] = []
    if(subPackages.length > 0) {
        subPackages.forEach((subPage: SubPageMetaDatum) => {
            sub = [
                ...sub,
                ...subPage.pages.map((p:PageMetaDatum) => ({
                    ...p,
                    path: `/${subPage.root}/${p.path}`
                }))
            ]
        })
    }
    return [...main,...sub]
}

/**
 * @Description: 获取所有需要登陆才可以访问的页面
 */
export const getNeedLoginPages = ():PageMetaDatum[] => {
    return getAllPages().filter(p => p && p.needLogin === true)
}
