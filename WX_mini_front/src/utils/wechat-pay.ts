const VIRTUAL_PAYMENT_MIN_SDK = '2.19.2'

const compareVersion = (sourceVersion = '', targetVersion = '') => {
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

const canUseVirtualPayment = () => {
  const wxApi = getWechatApi()
  if (!wxApi || typeof wxApi.requestVirtualPayment !== 'function') {
    return false
  }

  const sdkVersion = uni.getSystemInfoSync()?.SDKVersion || ''
  if (compareVersion(sdkVersion, VIRTUAL_PAYMENT_MIN_SDK) >= 0) {
    return true
  }
  return typeof wxApi.canIUse === 'function' ? !!wxApi.canIUse('requestVirtualPayment') : false
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
        if (error?.errCode === -2 || error?.errMsg?.includes('cancel')) {
          reject({ code: 'PAY_CANCEL', msg: '用户取消支付' })
          return
        }
        reject(new Error(error?.errMsg || '调起微信虚拟支付失败'))
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
