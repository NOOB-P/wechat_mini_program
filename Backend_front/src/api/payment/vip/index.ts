import api from '@/utils/http'

/**
 * 获取会员套餐列表
 */
export async function fetchVipPackages() {
  return api.get<any[]>({
    url: '/api/vip/admin/list'
  })
}

/**
 * 更新套餐信息 (权益等)
 */
export async function updateVipPackage(data: any) {
  return api.post({
    url: '/api/vip/admin/update-config',
    data
  })
}

/**
 * 更新套餐价格
 */
export async function updatePackagePrice(data: any) {
  return api.post({
    url: '/api/vip/admin/update-pricing',
    data
  })
}

/**
 * 切换启用状态
 */
export async function toggleVipStatus(id: number, isEnabled: number) {
  return api.post({
    url: '/api/vip/admin/toggle-status',
    data: { id, isEnabled }
  })
}
