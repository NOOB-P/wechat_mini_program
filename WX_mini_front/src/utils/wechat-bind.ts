import { reactive } from 'vue'

import { bindWechatOpenidApi } from '@/api/login'
import { getUserInfoApi } from '@/api/mine'

export type EnsureWechatBindOptions = {
  force?: boolean
  rebind?: boolean
  title?: string
  subtitle?: string
  reasons?: string[]
  confirmText?: string
  cancelText?: string
  successMessage?: string
}

type WechatBindErrorCode =
  | 'WECHAT_BIND_CANCELLED'
  | 'WECHAT_BIND_REQUIRED'
  | 'WECHAT_BIND_FAILED'
  | 'WECHAT_BIND_REFRESH_FAILED'

type WechatBindError = Error & {
  code?: WechatBindErrorCode
  msg?: string
}

type PendingHandlers = {
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

const DEFAULT_REASONS = [
  '接收课程提醒，重要消息不错过',
  '同步多端学习进度，换设备也能接着学',
  '保障支付安全，减少订单和账号风险'
]

const popupState = reactive({
  visible: false,
  force: false,
  rebind: false,
  loading: false,
  title: '绑定微信',
  subtitle: '绑定后可接收课程提醒、同步多端学习进度，并提升支付安全。',
  reasons: [...DEFAULT_REASONS],
  confirmText: '立即绑定',
  cancelText: '暂不绑定',
  successMessage: '微信绑定成功'
})

export const PAYMENT_WECHAT_BIND_OPTIONS: EnsureWechatBindOptions = {
  force: true,
  title: '支付前请先绑定微信',
  subtitle: '为了接收课程提醒、同步多端进度，并保障支付安全，请先完成微信绑定。',
  successMessage: '微信绑定成功'
}

let pendingPromise: Promise<any> | null = null
let pendingHandlers: PendingHandlers | null = null
let bindPromise: Promise<any> | null = null

const createWechatBindError = (code: WechatBindErrorCode, msg: string): WechatBindError => {
  const error = new Error(msg) as WechatBindError
  error.code = code
  error.msg = msg
  return error
}

const normalizeWechatId = (userInfo?: Record<string, any> | null) => {
  return userInfo?.wxid || userInfo?.openid || ''
}

const normalizeUserInfo = (userInfo?: Record<string, any> | null) => {
  if (!userInfo) {
    return {}
  }

  return {
    ...userInfo,
    wxid: normalizeWechatId(userInfo)
  }
}

const getDefaultSubtitle = (options: EnsureWechatBindOptions = {}) => {
  if (options.rebind) {
    return '当前操作需要重新校验微信身份，请重新完成微信绑定后再继续。'
  }
  if (options.force) {
    return '当前操作需要先完成微信绑定，绑定后可接收课程提醒、同步进度，并保障支付安全。'
  }
  return '绑定后可接收课程提醒、同步多端学习进度，并提升支付安全。'
}

const applyPopupOptions = (options: EnsureWechatBindOptions = {}) => {
  popupState.force = Boolean(options.force)
  popupState.rebind = Boolean(options.rebind)
  popupState.title = options.title || '绑定微信'
  popupState.subtitle = options.subtitle || getDefaultSubtitle(options)
  popupState.reasons = [...(options.reasons?.length ? options.reasons : DEFAULT_REASONS)]
  popupState.confirmText = options.confirmText || '立即绑定'
  popupState.cancelText = options.cancelText || '暂不绑定'
  popupState.successMessage = options.successMessage || '微信绑定成功'
}

const getWechatLoginCode = () => {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
          return
        }
        reject(createWechatBindError('WECHAT_BIND_FAILED', '获取微信登录凭证失败'))
      },
      fail: () => reject(createWechatBindError('WECHAT_BIND_FAILED', '微信授权失败'))
    })
  })
}

const resolvePending = (value: any) => {
  pendingHandlers?.resolve(value)
  pendingHandlers = null
  pendingPromise = null
}

const rejectPending = (reason: any) => {
  pendingHandlers?.reject(reason)
  pendingHandlers = null
  pendingPromise = null
}

const closePopup = () => {
  popupState.visible = false
  popupState.force = false
  popupState.rebind = false
  popupState.loading = false
}

export const isWechatBound = (userInfo?: Record<string, any> | null) => {
  return Boolean(normalizeWechatId(userInfo || uni.getStorageSync('userInfo')))
}

export const maskWechatIdentifier = (identifier?: string) => {
  if (!identifier) {
    return ''
  }
  if (identifier.length <= 2) {
    return `${identifier[0]}*`
  }
  if (identifier.length <= 6) {
    return `${identifier.slice(0, 1)}***${identifier.slice(-1)}`
  }
  return `${identifier.slice(0, 3)}***${identifier.slice(-3)}`
}

export const refreshWechatUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    const currentUserInfo = normalizeUserInfo(res.data || {})
    const cachedUserInfo = uni.getStorageSync('userInfo') || {}
    const mergedUserInfo = {
      ...cachedUserInfo,
      ...currentUserInfo
    }
    uni.setStorageSync('userInfo', mergedUserInfo)
    return mergedUserInfo
  } catch (error: any) {
    throw createWechatBindError('WECHAT_BIND_REFRESH_FAILED', error?.msg || error?.message || '获取用户信息失败')
  }
}

export const bindWechatAccount = async (successMessage = '微信绑定成功') => {
  if (bindPromise) {
    return bindPromise
  }

  bindPromise = (async () => {
    const code = await getWechatLoginCode()
    await bindWechatOpenidApi(code)
    const userInfo = await refreshWechatUserInfo()
    if (successMessage) {
      uni.showToast({
        title: successMessage,
        icon: 'none'
      })
    }
    return userInfo
  })().catch((error: any) => {
    throw createWechatBindError('WECHAT_BIND_FAILED', error?.msg || error?.message || '微信绑定失败')
  }).finally(() => {
    bindPromise = null
  })

  return bindPromise
}

export const ensureWechatBound = async (options: EnsureWechatBindOptions = {}) => {
  const localUserInfo = normalizeUserInfo(uni.getStorageSync('userInfo'))
  if (!options.rebind && isWechatBound(localUserInfo)) {
    return localUserInfo
  }

  applyPopupOptions(options)

  if (pendingPromise) {
    return pendingPromise
  }

  popupState.visible = true
  pendingPromise = new Promise((resolve, reject) => {
    pendingHandlers = { resolve, reject }
  })
  return pendingPromise
}

export const confirmWechatBind = async () => {
  if (popupState.loading) {
    return
  }

  popupState.loading = true
  try {
    const userInfo = await bindWechatAccount(popupState.successMessage)
    closePopup()
    resolvePending(userInfo)
  } catch (error: any) {
    popupState.loading = false
    uni.showToast({
      title: error?.msg || error?.message || '微信绑定失败',
      icon: 'none'
    })
  }
}

export const cancelWechatBind = () => {
  const error = popupState.force
    ? createWechatBindError('WECHAT_BIND_REQUIRED', '当前操作需要先完成微信绑定')
    : createWechatBindError('WECHAT_BIND_CANCELLED', '已取消微信绑定')

  if (popupState.force) {
    uni.showToast({
      title: error.msg || '当前操作需要先完成微信绑定',
      icon: 'none'
    })
  }

  closePopup()
  rejectPending(error)
}

export const runWithWechatBindGuard = async <T>(
  task: () => Promise<T>,
  options: EnsureWechatBindOptions = {}
) => {
  const bindOptions = {
    force: true,
    ...options
  }

  await ensureWechatBound(bindOptions)

  try {
    return await task()
  } catch (error: any) {
    if (error?.code !== 40101) {
      throw error
    }

    await ensureWechatBound({
      ...bindOptions,
      rebind: true
    })
    return task()
  }
}

export const useWechatBindPopup = () => {
  return {
    popupState,
    confirmWechatBind,
    cancelWechatBind
  }
}
