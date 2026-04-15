import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export const supportInteractionRoutes: AppRouteRecord = {
  path: '/support-interaction',
  component: RoutesAlias.Layout,
  name: 'SupportInteraction',
  meta: {
    title: '客服与互动',
    icon: 'ri:customer-service-2-line',
    sort: 3
  },
  children: [
    {
      path: 'faq',
      name: 'FaqManage',
      component: '/support-interaction/faq',
      meta: {
        title: 'FAQ 管理',
        authMark: 'support:faq:list'
      }
    },
    {
      path: 'wechat',
      name: 'WechatConfig',
      component: '/support-interaction/wechat',
      meta: {
        title: '微信群二维码',
        authMark: 'support:wechat:list'
      }
    }
  ]
}
