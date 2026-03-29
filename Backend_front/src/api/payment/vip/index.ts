import { mockVipPackages } from '@/mock/payment/vip'

/**
 * 获取会员套餐列表
 */
export async function fetchVipPackages() {
  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: mockVipPackages
  })
}

/**
 * 更新套餐信息
 * @param params 套餐参数
 */
export async function updateVipPackage(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

/**
 * 更新套餐价格
 * @param params 价格参数
 */
export async function updatePackagePrice(params: any) {
  return Promise.resolve({
    code: 200,
    msg: '价格调整成功',
    data: null
  })
}
