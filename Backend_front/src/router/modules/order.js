import { RoutesAlias } from '../routesAlias';
export const orderRoutes = {
    path: '/order',
    name: 'Order',
    component: RoutesAlias.Layout,
    meta: {
        title: '订单管理',
        icon: 'ri:file-list-3-line',
        sort: 2
    },
    children: [
        {
            path: 'vip',
            name: 'VipOrderManage',
            component: '/order/vip',
            meta: {
                title: 'VIP 订单管理',
                keepAlive: true,
                authMark: 'order:vip:list'
            }
        },
        {
            path: 'course',
            name: 'CourseOrderManage',
            component: '/order/course',
            meta: {
                title: '课程订单管理',
                keepAlive: true,
                authMark: 'order:course:list'
            }
        },
        {
            path: 'print',
            name: 'PrintOrderManage',
            component: '/order/print',
            meta: {
                title: '打印订单管理',
                keepAlive: true,
                authMark: 'order:print:list'
            }
        }
    ]
};
//# sourceMappingURL=order.js.map