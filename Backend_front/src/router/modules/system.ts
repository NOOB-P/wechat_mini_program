import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authMark: 'system:user:list'
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authMark: 'system:role:list'
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'content-management',
      name: 'ContentManagement',
      component: '/system/content-management/index',
      meta: {
        title: 'menus.system.contentManagement',
        keepAlive: true,
        fixedTab: false,
        roles: ['R_SUPER', 'R_ADMIN'],
        authMark: 'system:permission:list'
      }
    }
    // {
    //   path: 'menu',
    //   name: 'Menus',
    //   component: '/system/menu',
    //   meta: {
    //     title: 'menus.system.menu',
    //     keepAlive: true,
    //     roles: ['R_SUPER'],
    //     authList: [
    //       { title: '新增', authMark: 'add' },
    //       { title: '编辑', authMark: 'edit' },
    //       { title: '删除', authMark: 'delete' }
    //     ]
    //   }
    // }
  ]
}
