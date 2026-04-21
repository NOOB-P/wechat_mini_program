import { bindWechatOpenidApi } from '@/api/login'
import { getUserInfoApi } from '@/api/mine'

const getWechatLoginCode = () => {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
          return
        }
        reject(new Error('获取微信登录凭证失败'))
      },
      fail: () => reject(new Error('微信授权失败'))
    })
  })
}

export const refreshUserInfo = async () => {
  const res = await getUserInfoApi()
  if (res.code !== 200) {
    throw new Error(res.msg || '获取用户信息失败')
  }
  uni.setStorageSync('userInfo', res.data)
  return res.data
}

export const ensureWechatPayBound = async () => {
  const localUserInfo = uni.getStorageSync('userInfo')
  if (localUserInfo?.wxid) {
    return localUserInfo
  }

  const code = await getWechatLoginCode()
  const bindRes = await bindWechatOpenidApi(code)
  if (bindRes.code !== 200) {
    throw new Error(bindRes.msg || '绑定微信失败')
  }
  return refreshUserInfo()
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
