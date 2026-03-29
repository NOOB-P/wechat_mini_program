import { dashboardRoutes } from './dashboard'
import { coreBusinessRoutes } from './core-business'
import { courseStudyRoutes } from './course-study'
import { orderRoutes } from './order'
import { paymentRoutes } from './payment'
import { supportInteractionRoutes } from './support-interaction'
import { systemRoutes } from './system'
import { logRoutes } from './log'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  coreBusinessRoutes,
  orderRoutes,
  courseStudyRoutes,
  paymentRoutes,
  supportInteractionRoutes,
  systemRoutes,
  logRoutes,
  resultRoutes,
  exceptionRoutes
]
