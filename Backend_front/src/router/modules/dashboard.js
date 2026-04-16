export const dashboardRoutes = {
    name: 'Dashboard',
    path: '/dashboard',
    component: '/index/index',
    meta: {
        title: 'menus.dashboard.title',
        icon: 'ri:pie-chart-line',
        roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
        {
            path: 'analysis',
            name: 'Analysis',
            component: '/dashboard/analysis',
            meta: {
                title: '数据统计',
                keepAlive: true,
                fixedTab: true,
                authMark: 'dashboard:analysis:view'
            }
        }
    ]
};
//# sourceMappingURL=dashboard.js.map