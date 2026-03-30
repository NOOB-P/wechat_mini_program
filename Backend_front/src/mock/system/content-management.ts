import { mockUserList } from './user'

/**
 * 可配置的所有主模块列表
 */
export const allModules: Api.ContentManage.ModuleItem[] = [
  { title: '仪表盘', path: '/dashboard', icon: 'ri:pie-chart-line' },
  { title: '核心业务', path: '/core-business', icon: 'ri:briefcase-line' },
  { title: '订单管理', path: '/order', icon: 'ri:article-line' },
  { title: '课程与自习室', path: '/course-study', icon: 'ri:book-open-line' },
  { title: '付费管理', path: '/payment', icon: 'ri:bank-card-line' },
  { title: '客服与互动', path: '/support-interaction', icon: 'ri:customer-service-2-line' },
  { title: '系统管理', path: '/system', icon: 'ri:settings-4-line' },
  { title: '日志管理', path: '/log', icon: 'ri:history-line' }
]

/**
 * 模拟用户模块权限数据
 */
export const mockUserPermissions: Api.ContentManage.UserModulePermission[] = [
  {
    id: 1,
    userName: 'admin',
    nickName: '超级管理员',
    userRoles: ['R_SUPER'],
    allowedModules: allModules.map(m => m.path) // 超管拥有所有权限
  },
  {
    id: 2,
    userName: 'school_admin',
    nickName: '第一中学校长',
    userRoles: ['R_SCHOOL'],
    allowedModules: ['/dashboard', '/core-business', '/course-study']
  },
  {
    id: 10,
    userName: 'user_a',
    nickName: '付费管理员A',
    userRoles: ['R_ADMIN'],
    allowedModules: ['/payment'] // 仅能看到付费管理
  }
]
