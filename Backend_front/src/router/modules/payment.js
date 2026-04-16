import { RoutesAlias } from '../routesAlias';
export const paymentRoutes = {
    path: '/payment',
    name: 'Payment',
    component: RoutesAlias.Layout,
    meta: {
        title: '付费管理',
        icon: 'ri:money-cny-box-line',
        sort: 5
    },
    children: [
        {
            path: 'vip',
            name: 'VipPackageManage',
            component: '/payment/vip',
            meta: {
                title: '会员套餐设置',
                keepAlive: true,
                authMark: 'payment:vip:list'
            }
        },
        {
            path: 'print-price',
            name: 'PrintPriceManage',
            component: '/payment/print',
            meta: {
                title: '打印价格设置',
                keepAlive: true,
                authMark: 'payment:print:list'
            }
        }
    ]
};
//# sourceMappingURL=payment.js.map