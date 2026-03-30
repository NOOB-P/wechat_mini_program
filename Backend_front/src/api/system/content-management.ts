import { mockUserPermissions, allModules } from '@/mock/system/content-management'

/**
 * 获取所有可配置的模块列表
 */
export async function fetchGetAllModules() {
  return {
    code: 200,
    msg: '获取成功',
    data: allModules
  }
}

/**
 * 获取用户权限列表
 */
export async function fetchGetUserPermissions(params: Api.ContentManage.PermissionSearchParams) {
  const { current = 1, size = 10, userName, nickName } = params
  
  // 模拟搜索过滤
  let filteredList = [...mockUserPermissions]
  if (userName) filteredList = filteredList.filter(item => item.userName.includes(userName))
  if (nickName) filteredList = filteredList.filter(item => item.nickName.includes(nickName))

  const total = filteredList.length
  const start = (current - 1) * size
  const end = start + size
  const records = filteredList.slice(start, end)

  return {
    code: 200,
    msg: '获取成功',
    data: {
      records,
      total,
      current,
      size
    }
  }
}

/**
 * 更新用户权限
 */
export async function fetchUpdateUserPermissions(userId: number, allowedModules: string[]) {
  return {
    code: 200,
    msg: '更新成功',
    data: null
  }
}
