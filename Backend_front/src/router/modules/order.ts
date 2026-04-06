import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const orderRoutes: AppRouteRecord = {
  path: '/order',
  name: 'Order',
  component: RoutesAlias.Layout,
  meta: {
    title: '订单管理',
    icon: 'ri:file-list-3-line',
    sort: 2 // 与核心业务同级，可以根据需要调整顺序
  },
  children: [
    {
      path: 'vip',
      name: 'VipOrderManage',
      component: '/order/vip',
      meta: {
        title: 'VIP 订单管理',
        keepAlive: true
      }
    },
    {
      path: 'course',
      name: 'CourseOrderManage',
      component: '/order/course',
      meta: {
        title: '课程订单管理',
        keepAlive: true
      }
    },
    {
      path: 'print',
      name: 'PrintOrderManage',
      component: '/order/print',
      meta: {
        title: '打印订单管理',
        keepAlive: true
      }
    }
  ]
}
