import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const orderRoutes: AppRouteRecord = {
  path: '/order-management',
  name: 'OrderManagement',
  component: RoutesAlias.Layout,
  redirect: '/order-management/vip',
  meta: {
    title: '订单管理',
    icon: 'ri:file-list-3-line',
    sort: 3
  },
  children: [
    {
      path: 'vip',
      name: 'VipOrderManage',
      component: '/order/vip/index',
      meta: {
        title: 'VIP 订单管理',
        keepAlive: true,
        authMark: 'order:vip:list'
      }
    },
    {
      path: 'course',
      name: 'CourseOrderManage',
      component: '/order/course/index',
      meta: {
        title: '课程订单管理',
        keepAlive: true,
        authMark: 'order:course:list'
      }
    },
    {
      path: 'print',
      name: 'PrintOrderManage',
      component: '/order/print/index',
      meta: {
        title: '打印订单管理',
        keepAlive: true,
        authMark: 'order:print:list'
      }
    }
  ]
}
