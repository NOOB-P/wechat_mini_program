import { pages, subPackages } from '@/pages.json'

type PageRoute = {
  path: string
  needLogin?: boolean
  [key: string]: any
}

type SubPackageRoute = {
  root: string
  pages: PageRoute[]
}

/**
 * @Description: 获取所有页面
 */
export const getAllPages = (): PageRoute[] => {
  const main = (pages as PageRoute[]).map((page) => ({
    ...page,
    path: `/${page.path}`
  }))

  const sub = ((subPackages ?? []) as SubPackageRoute[]).flatMap((subPackage) =>
    subPackage.pages.map((page) => ({
      ...page,
      path: `/${subPackage.root}/${page.path}`
    }))
  )

  return [...main, ...sub]
}

/**
 * @Description: 获取所有需要登录才能访问的页面
 */
export const getNeedLoginPages = (): PageRoute[] => {
  return getAllPages().filter((page) => page.needLogin === true)
}
