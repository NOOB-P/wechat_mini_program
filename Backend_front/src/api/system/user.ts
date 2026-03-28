import { mockUserList } from '@/mock/system/user'

/** 获取用户列表 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  const { current = 1, size = 10, userName, userPhone, userEmail, status, userType, schoolName, className } = params
  
  // 模拟搜索过滤
  let filteredList = [...mockUserList]
  if (userName) filteredList = filteredList.filter(item => item.userName.includes(userName))
  if (userPhone) filteredList = filteredList.filter(item => item.userPhone.includes(userPhone))
  if (userEmail) filteredList = filteredList.filter(item => item.userEmail.includes(userEmail))
  if (status) filteredList = filteredList.filter(item => item.status === status)
  if (userType) filteredList = filteredList.filter(item => item.userType === userType)
  if (schoolName) filteredList = filteredList.filter(item => item.schoolName === schoolName)
  if (className) filteredList = filteredList.filter(item => item.className === className)

  const total = filteredList.length
  const start = (current - 1) * size
  const end = start + size
  const records = filteredList.slice(start, end)

  return Promise.resolve({
    code: 200,
    msg: '获取成功',
    data: {
      records,
      total,
      current,
      size
    }
  })
}

/** 新增用户 */
export function fetchAddUser(params: Partial<Api.SystemManage.UserListItem>) {
  return Promise.resolve({
    code: 200,
    msg: '添加成功',
    data: null
  })
}

/** 更新用户 */
export function fetchUpdateUser(params: Partial<Api.SystemManage.UserListItem>) {
  return Promise.resolve({
    code: 200,
    msg: '更新成功',
    data: null
  })
}

/** 删除用户 */
export function fetchDeleteUser(id: number) {
  return Promise.resolve({
    code: 200,
    msg: '删除成功',
    data: null
  })
}
