const VIRTUAL_PAYMENT_MIN_SDK = '2.19.2'
const APPLE_MIN_OS_VERSION = '15.0.0'
const APPLE_MIN_WECHAT_VERSION = '8.0.68'

const compareVersion = (sourceVersion: string, targetVersion: string) => {
  if (typeof sourceVersion !== 'string' || typeof targetVersion !== 'string') return 0
  const sourceList = sourceVersion.split('.')
  const targetList = targetVersion.split('.')
  const maxLength = Math.max(sourceList.length, targetList.length)

  while (sourceList.length < maxLength) {
    sourceList.push('0')
  }
  while (targetList.length < maxLength) {
    targetList.push('0')
  }

  for (let index = 0; index < maxLength; index += 1) {
    const source = Number.parseInt(sourceList[index], 10)
    const target = Number.parseInt(targetList[index], 10)
    if (source > target) {
      return 1
    }
    if (source < target) {
      return -1
    }
  }
  return 0
}

const getWechatApi = () => (globalThis as Record<string, any>).wx

/**
 * 检查 iOS 虚拟支付环境是否满足条件
 * 条件：iOS 15+ 且 微信 8.0.68+
 */
export const checkAppleVirtualPaymentEnv = () => {
  const info = uni.getSystemInfoSync()
  const platform = info.platform?.toLowerCase() || ''
  
  // 如果不是 iOS 设备，直接返回 true
  if (platform !== 'ios') {
    return { success: true }
  }

  const system = info.system || '' // 例如 "iOS 15.0"
  const version = info.version || '' // 微信版本号

  // 提取系统版本号
  const osVersion = system.replace(/[^0-9.]/g, '')
  
  const isOsSupported = compareVersion(osVersion, APPLE_MIN_OS_VERSION) >= 0
  const isWechatSupported = compareVersion(version, APPLE_MIN_WECHAT_VERSION) >= 0

  if (!isOsSupported || !isWechatSupported) {
    let msg = '如需使用支付，需同时满足：\n'
    if (!isOsSupported) msg += '1. 系统版本需 iOS 15 及以上\n'
    if (!isWechatSupported) msg += '2. 微信版本需 8.0.68 及以上\n'
    msg += '请升级后重试'
    
    return {
      success: false,
      msg
    }
  }

  return { success: true }
}

const canUseVirtualPayment = () => {
  const wxApi = getWechatApi()
  if (!wxApi) {
    return false
  }

  const sdkVersion = uni.getSystemInfoSync()?.SDKVersion || ''
  const isVersionSupported = compareVersion(sdkVersion, VIRTUAL_PAYMENT_MIN_SDK) >= 0
  const isApiSupported = typeof wxApi.canIUse === 'function' ? !!wxApi.canIUse('requestVirtualPayment') : typeof wxApi.requestVirtualPayment === 'function'

  return isVersionSupported || isApiSupported
}

export const requestWechatPay = (payParams: Record<string, any>) => {
  return new Promise<void>((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      ...payParams,
      success: () => resolve(),
      fail: (error) => {
        if (error?.errMsg?.includes('cancel')) {
          reject({ code: 'PAY_CANCEL', msg: '用户取消支付' })
          return
        }
        reject(new Error(error?.errMsg || '调起微信支付失败'))
      }
    })
  })
}

export const requestWechatVirtualPay = (payParams: Record<string, any>) => {
  return new Promise<void>((resolve, reject) => {
    // 1. 检查 iOS 环境兼容性
    const envCheck = checkAppleVirtualPaymentEnv()
    if (!envCheck.success) {
      uni.showModal({
        title: '支付提示',
        content: envCheck.msg,
        showCancel: false,
        confirmText: '我知道了'
      })
      reject({ code: 'ENV_NOT_SUPPORTED', msg: envCheck.msg })
      return
    }

    // 2. 检查基础库 SDK 版本
    if (!canUseVirtualPayment()) {
      reject({ code: 'SDK_VERSION_LOW', msg: '当前微信版本过低，不支持虚拟支付，请升级后重试' })
      return
    }

    const { signData, paySig, signature, mode } = payParams
    if (!signData || !paySig || !signature || !mode) {
      reject(new Error('虚拟支付参数缺失'))
      return
    }
    const wxApi = getWechatApi()
    wxApi.requestVirtualPayment({
      mode,
      signData,
      paySig,
      signature,
      success: () => resolve(),
      
      fail: (error: Record<string, any>) => {
        const { errMsg, errCode } = error
        console.error('requestVirtualPayment fail', errMsg, errCode)
        if (errCode === -2 || errMsg?.includes('cancel')) {
          reject({ code: 'PAY_CANCEL', msg: '用户取消支付', errCode, errMsg })
          return
        }
        if (errCode === -15012 || errMsg?.includes('ORDER_CLOSED')) {
          reject({ code: 'ORDER_CLOSED', msg: '支付订单已关闭，请重新下单', errCode, errMsg })
          return
        }
        reject({ code: 'VIRTUAL_PAY_FAILED', msg: errMsg || '调起微信虚拟支付失败', errCode, errMsg })
      }
    })

  })
}

export const requestWechatFreePay = () => {
  return Promise.resolve()
}

export const requestWechatPaymentByType = (paymentType: string, payParams: Record<string, any>) => {
  if (paymentType === 'FREE') {
    return requestWechatFreePay()
  }
  if (paymentType === 'VIRTUAL') {
    return requestWechatVirtualPay(payParams)
  }
  return requestWechatPay(payParams)
}
