import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { logRoutes } from './log'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { coreBusinessRoutes } from './core-business'
import { courseStudyRoutes } from './course-study'
import { supportInteractionRoutes } from './support-interaction'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  coreBusinessRoutes,
  courseStudyRoutes,
  supportInteractionRoutes,
  systemRoutes,
  logRoutes,
  resultRoutes,
  exceptionRoutes
]
