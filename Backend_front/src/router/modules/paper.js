import { RoutesAlias } from '../routesAlias';
export const paperRoutes = {
    path: '/paper-manage',
    component: RoutesAlias.Layout,
    name: 'PaperManageRoot',
    meta: {
        title: '名校试卷管理',
        icon: 'ri:file-paper-2-line',
        sort: 3
    },
    children: [
        {
            path: 'index',
            name: 'PaperManage',
            component: '/course-study/paper',
            meta: {
                title: '试卷列表',
                authMark: 'paper:manage:list'
            }
        }
    ]
};
//# sourceMappingURL=paper.js.map