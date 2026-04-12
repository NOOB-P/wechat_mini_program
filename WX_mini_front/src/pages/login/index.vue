<template>
  <view class="login-container">
    <view class="header">
      <view class="logo-box">
        <image class="logo-img" src="/static/logo.png" mode="aspectFit" />
        <view class="brand-name">优题慧</view>
      </view>
    </view>

    <view class="form-container">
      <wd-tabs v-model="loginType" custom-class="login-tabs">
        <wd-tab title="验证码登录" name="phone">
          <view class="input-group">
            <view class="input-item">
              <text class="prefix">+86</text>
              <wd-input v-model="phone" placeholder="请输入手机号" type="number" :maxlength="11" no-border />
            </view>
            <view class="input-item code-item">
              <wd-input
                v-model="code"
                placeholder="请输入验证码"
                type="number"
                :maxlength="6"
                use-suffix-slot
                no-border
              >
                <template #suffix>
                  <view class="code-btn-text" :class="{ disabled: countdown > 0 }" @click="countdown === 0 && sendCode()">
                    {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                  </view>
                </template>
              </wd-input>
            </view>
          </view>
        </wd-tab>

        <wd-tab title="账号登录" name="password">
          <view class="input-group">
            <view class="input-item">
              <wd-input v-model="phone" placeholder="请输入账号" type="text" no-border />
            </view>
            <view class="input-item">
              <wd-input v-model="password" placeholder="请输入密码" show-password type="text" no-border />
            </view>
          </view>
        </wd-tab>
      </wd-tabs>

      <!-- <view v-if="loginType === 'phone'" class="wechat-phone-login">
        <button class="wx-phone-login-btn" open-type="getPhoneNumber" @getphonenumber="handleWechatPhoneLogin">
          <wd-icon name="wechat" size="24px" color="#fff" />
          <text class="btn-text">微信手机号一键登录</text>
        </button>
      </view> -->

      <view class="action-btn">
        <wd-button type="primary" block custom-class="submit-btn" @click="handleLogin">登录</wd-button>
      </view>

      <view class="agreement-row">
        <wd-checkbox v-model="isAgreed" custom-class="agreement-checkbox" />
        <view class="agreement-text">
          请阅读并勾选<text class="link">《用户服务协议》</text><text class="link">《隐私政策》</text>
        </view>
      </view>

      <!-- <view class="sub-actions">
        <text class="link skip-link" @click="skipLogin">暂不登录，去首页逛逛</text>
      </view> -->
    </view>

    <!-- <view class="footer-slogan">
      让每个孩子成为最好的自己
    </view> -->

    <view class="third-party">
      <view class="divider">
        <text class="line"></text>
        <text class="text">其他方式登录</text>
        <text class="line"></text>
      </view>
      <view class="icons">
        <view class="icon-item" @click="thirdPartyLogin('wechat')">
          <wd-icon name="wechat" size="40px" color="#07C160" />
          <text class="icon-text">微信</text>
        </view>
        <!-- <view class="icon-item" @click="thirdPartyLogin('qq')">
          <wd-icon name="qq" size="40px" color="#12B7F5" />
          <text class="icon-text">QQ</text>
        </view> -->
      </view>
    </view>

    <wd-popup
      v-model="showRegisterPopup"
      position="bottom"
      custom-style="height: 70%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;"
    >
      <view class="popup-content">
        <view class="popup-title">快速注册</view>
        <view class="input-group">
          <wd-input v-model="registerForm.phone" placeholder="请输入手机号" type="number" :maxlength="11" no-border />
          <view class="code-wrapper">
            <wd-input
              v-model="registerForm.code"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
              use-suffix-slot
              no-border
            >
              <template #suffix>
                <view
                  class="code-btn-text"
                  :class="{ disabled: registerCountdown > 0 }"
                  @click="registerCountdown === 0 && sendRegisterCode()"
                >
                  {{ registerCountdown > 0 ? `${registerCountdown}s后重试` : '获取验证码' }}
                </view>
              </template>
            </wd-input>
          </view>
          <wd-input v-model="registerForm.password" placeholder="请设置密码" show-password type="text" no-border />
          <wd-input v-model="registerForm.nickname" placeholder="请输入昵称" type="text" no-border />
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleRegister">立即注册</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showForgotPopup"
      position="bottom"
      custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;"
    >
      <view class="popup-content">
        <view class="popup-title">找回密码</view>
        <view class="input-group">
          <wd-input v-model="forgotForm.phone" placeholder="请输入手机号" type="number" :maxlength="11" no-border />
          <view class="code-wrapper">
            <wd-input
              v-model="forgotForm.code"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
              use-suffix-slot
              no-border
            >
              <template #suffix>
                <view
                  class="code-btn-text"
                  :class="{ disabled: forgotCountdown > 0 }"
                  @click="forgotCountdown === 0 && sendForgotCode()"
                >
                  {{ forgotCountdown > 0 ? `${forgotCountdown}s后重试` : '获取验证码' }}
                </view>
              </template>
            </wd-input>
          </view>
          <wd-input v-model="forgotForm.password" placeholder="请输入新密码" show-password type="text" no-border />
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleForgot">重置密码</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showBindPhonePopup"
      position="bottom"
      custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;"
    >
      <view class="popup-content">
        <view class="popup-title">绑定手机号</view>
        <view class="input-group">
          <wd-input v-model="bindPhoneForm.phone" placeholder="请输入手机号" type="number" :maxlength="11" no-border />
          <view class="code-wrapper">
            <wd-input
              v-model="bindPhoneForm.code"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
              use-suffix-slot
              no-border
            >
              <template #suffix>
                <view
                  class="code-btn-text"
                  :class="{ disabled: bindPhoneCountdown > 0 }"
                  @click="bindPhoneCountdown === 0 && sendBindPhoneCode()"
                >
                  {{ bindPhoneCountdown > 0 ? `${bindPhoneCountdown}s后重试` : '获取验证码' }}
                </view>
              </template>
            </wd-input>
          </view>
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleBindPhone">确认绑定</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useToast } from 'wot-design-uni'
import {
  bindThirdPartyPhone,
  forgotPassword,
  loginByPassword,
  loginByPhone,
  loginByWechat,
  loginByWechatPhone,
  register,
  sendSmsCode,
  thirdPartyLoginApi
} from '@/api/login'

const toast = useToast()

const loginType = ref('phone')
const phone = ref('')
const code = ref('')
const password = ref('')
const countdown = ref(0)
const isAgreed = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const showRegisterPopup = ref(false)
const registerCountdown = ref(0)
let registerTimer: ReturnType<typeof setInterval> | null = null
const registerForm = ref({
  phone: '',
  code: '',
  password: '',
  nickname: ''
})

const showForgotPopup = ref(false)
const forgotCountdown = ref(0)
let forgotTimer: ReturnType<typeof setInterval> | null = null
const forgotForm = ref({
  phone: '',
  code: '',
  password: ''
})

const showBindPhonePopup = ref(false)
const bindPhoneCountdown = ref(0)
let bindPhoneTimer: ReturnType<typeof setInterval> | null = null
const bindPhoneForm = ref({
  phone: '',
  code: '',
  openid: '',
  type: ''
})

onMounted(() => {
  const token = uni.getStorageSync('token')
  if (token) {
    uni.switchTab({ url: '/pages/home/index' })
  }
})

onUnmounted(() => {
  clearLoginTimers()
})

const clearTimer = (currentTimer: ReturnType<typeof setInterval> | null) => {
  if (currentTimer) {
    clearInterval(currentTimer)
  }
}

const clearLoginTimers = () => {
  clearTimer(timer)
  clearTimer(registerTimer)
  clearTimer(forgotTimer)
  clearTimer(bindPhoneTimer)
}

const startCountdown = (target: typeof countdown, setter: (value: ReturnType<typeof setInterval>) => void) => {
  target.value = 60
  const currentTimer = setInterval(() => {
    target.value -= 1
    if (target.value <= 0) {
      clearInterval(currentTimer)
    }
  }, 1000)
  setter(currentTimer)
}

const navigateAfterLogin = (isBoundStudent?: boolean, bindPhone?: string) => {
  setTimeout(() => {
    if (isBoundStudent) {
      uni.switchTab({ url: '/pages/home/index' })
      return
    }

    const targetPhone = bindPhone || phone.value
    uni.redirectTo({
      url: targetPhone ? `/pages/auth/bind-student?phone=${targetPhone}` : '/pages/auth/bind-student'
    })
  }, 1500)
}

const handleLoginSuccess = (
  res: any,
  options?: {
    successMessage?: string
    bindPhone?: string
  }
) => {
  if (res.data?.token) {
    uni.setStorageSync('token', res.data.token)
  }

  toast.success(options?.successMessage || '登录成功')
  navigateAfterLogin(res.data?.isBoundStudent, options?.bindPhone)
}

const getWechatLoginCode = () => {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.code) {
          resolve(loginRes.code)
          return
        }
        reject(new Error('获取微信登录凭证失败'))
      },
      fail: () => {
        reject(new Error('微信授权失败'))
      }
    })
  })
}

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }

  try {
    await sendSmsCode(phone.value)
    toast.success('验证码已发送')
    clearTimer(timer)
    startCountdown(countdown, (value) => {
      timer = value
    })
  } catch (error) {
    console.error('发送验证码失败', error)
  }
}

const skipLogin = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const handleLogin = async () => {
  if (!isAgreed.value) {
    return toast.show('请先勾选同意用户协议和隐私政策')
  }
  if (!phone.value) {
    return toast.show('请输入手机号')
  }
  if (loginType.value === 'phone' && !code.value) {
    return toast.show('请输入验证码')
  }
  if (loginType.value === 'password' && !password.value) {
    return toast.show('请输入密码')
  }

  try {
    const res =
      loginType.value === 'phone'
        ? await loginByPhone({ phone: phone.value, code: code.value })
        : await loginByPassword({ phone: phone.value, password: password.value })

    if (res.code === 200) {
      handleLoginSuccess(res, { bindPhone: phone.value })
      return
    }

    toast.error(res.msg || '登录失败')
  } catch (error: any) {
    toast.error(error.msg || '网络错误，请稍后重试')
  }
}

const handleWechatPhoneLogin = async (event: any) => {
  const phoneCode = event?.detail?.code
  if (!phoneCode) {
    if (event?.detail?.errMsg?.includes('deny')) {
      toast.show('您已取消手机号授权')
      return
    }
    toast.show('获取手机号失败，请稍后重试')
    return
  }

  try {
    const wxCode = await getWechatLoginCode()
    const res = await loginByWechatPhone({
      phoneCode,
      wxCode
    })

    if (res.code === 200) {
      handleLoginSuccess(res, {
        successMessage: '手机号授权登录成功',
        bindPhone: res.data?.userInfo?.phone
      })
      return
    }

    toast.error(res.msg || '手机号授权登录失败')
  } catch (error: any) {
    toast.error(error.msg || error.message || '手机号授权登录失败')
  }
}

const goToRegister = () => {
  showRegisterPopup.value = true
}

const goToForgotPassword = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}

const sendRegisterCode = async () => {
  if (!registerForm.value.phone || registerForm.value.phone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }

  try {
    await sendSmsCode(registerForm.value.phone)
    toast.success('验证码已发送')
    clearTimer(registerTimer)
    startCountdown(registerCountdown, (value) => {
      registerTimer = value
    })
  } catch (error) {
    console.error('发送注册验证码失败', error)
  }
}

const handleRegister = async () => {
  if (!registerForm.value.phone || !registerForm.value.code || !registerForm.value.password) {
    return toast.show('请填写完整注册信息')
  }

  try {
    const res = await register(registerForm.value)
    if (res.code === 200) {
      toast.success('注册成功')
      showRegisterPopup.value = false
      return
    }

    toast.error(res.msg || '注册失败')
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const sendForgotCode = async () => {
  if (!forgotForm.value.phone || forgotForm.value.phone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }

  try {
    await sendSmsCode(forgotForm.value.phone)
    toast.success('验证码已发送')
    clearTimer(forgotTimer)
    startCountdown(forgotCountdown, (value) => {
      forgotTimer = value
    })
  } catch (error) {
    console.error('发送找回密码验证码失败', error)
  }
}

const handleForgot = async () => {
  if (!forgotForm.value.phone || !forgotForm.value.code || !forgotForm.value.password) {
    return toast.show('请填写完整信息')
  }

  try {
    const res = await forgotPassword(forgotForm.value)
    if (res.code === 200) {
      toast.success('密码重置成功')
      showForgotPopup.value = false
      return
    }

    toast.error(res.msg || '重置失败')
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const sendBindPhoneCode = async () => {
  if (!bindPhoneForm.value.phone || bindPhoneForm.value.phone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }

  try {
    await sendSmsCode(bindPhoneForm.value.phone)
    toast.success('验证码已发送')
    clearTimer(bindPhoneTimer)
    startCountdown(bindPhoneCountdown, (value) => {
      bindPhoneTimer = value
    })
  } catch (error) {
    console.error('发送绑定手机号验证码失败', error)
  }
}

const handleBindPhone = async () => {
  if (!bindPhoneForm.value.phone || !bindPhoneForm.value.code) {
    return toast.show('请填写完整信息')
  }

  try {
    const res = await bindThirdPartyPhone(bindPhoneForm.value)
    if (res.code === 200) {
      showBindPhonePopup.value = false
      handleLoginSuccess(res, {
        successMessage: '绑定成功',
        bindPhone: bindPhoneForm.value.phone
      })
      return
    }

    toast.error(res.msg || '绑定失败')
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const handleThirdPartySuccess = (res: any, type: string) => {
  if (res.data?.needBind) {
    toast.show('请先绑定手机号')
    bindPhoneForm.value.openid = res.data.openid
    bindPhoneForm.value.type = type
    showBindPhonePopup.value = true
    return
  }

  if (res.data?.token) {
    handleLoginSuccess(res, {
      successMessage: `${type === 'wechat' ? '微信' : 'QQ'}登录成功`,
      bindPhone: res.data?.userInfo?.phone
    })
  }
}

const thirdPartyLogin = (type: string) => {
  if (type === 'wechat') {
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        if (!loginRes.code) {
          toast.error('获取微信登录凭证失败')
          return
        }

        try {
          const res = await loginByWechat(loginRes.code)
          if (res.code === 200) {
            handleThirdPartySuccess(res, 'wechat')
            return
          }
          toast.error(res.msg || '微信登录失败')
        } catch (error: any) {
          toast.error(error.msg || '微信登录异常')
        }
      },
      fail: () => {
        toast.show('微信授权失败')
      }
    })
    return
  }

  uni.login({
    provider: 'qq',
    success: async () => {
      try {
        const res = await thirdPartyLoginApi('qq', 'mock_qq_openid')
        handleThirdPartySuccess(res, 'qq')
      } catch (error) {
        console.error('QQ 登录失败', error)
      }
    },
    fail: () => {
      mockThirdPartyLogin('qq')
    }
  })
}

const mockThirdPartyLogin = async (type: string) => {
  toast.success(`正在模拟${type === 'wechat' ? '微信' : 'QQ'}登录...`)
  try {
    const res = await thirdPartyLoginApi(type, `mock_${type}_openid_123`)
    handleThirdPartySuccess(res, type)
  } catch (error) {
    console.error('模拟第三方登录失败', error)
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef7ff 0%, #ffffff 300rpx);
  padding: 40rpx;
  display: flex;
  flex-direction: column;

  .header {
    margin-top: 120rpx;
    margin-bottom: 80rpx;
    display: flex;
    justify-content: center;

    .logo-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .logo-img {
        width: 160rpx;
        height: 160rpx;
        background: #fff;
        border-radius: 40rpx;
        box-shadow: 0 10rpx 30rpx rgba(26, 95, 142, 0.1);
        padding: 20rpx;
      }
      
      .brand-name {
        margin-top: 24rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #1a5f8e;
        letter-spacing: 4rpx;
      }
    }
  }

  .form-container {
    flex: 1;
    padding: 0 20rpx;

    :deep(.login-tabs) {
      .wd-tabs__nav {
        background-color: transparent;
        margin-bottom: 60rpx;
      }
      .wd-tabs__nav-item {
        font-size: 34rpx;
        color: #999;
        font-weight: normal;
        &.is-active {
          color: #333;
          font-weight: bold;
          font-size: 38rpx;
        }
      }
      .wd-tabs__line {
        background-color: #1a5f8e;
        width: 40rpx !important;
        height: 6rpx;
        border-radius: 3rpx;
      }
    }

    .input-group {
      margin-top: 20rpx;
      display: flex;
      flex-direction: column;
      gap: 30rpx;

      .input-item {
        background-color: #f5f7f9;
        border-radius: 50rpx;
        padding: 0 40rpx;
        height: 100rpx;
        display: flex;
        align-items: center;
        
        .prefix {
          font-size: 30rpx;
          color: #333;
          margin-right: 20rpx;
          padding-right: 20rpx;
          border-right: 1rpx solid #ddd;
        }

        :deep(.wd-input) {
          flex: 1;
          background-color: transparent;
          height: 100rpx;
          padding: 0;
        }

        :deep(.wd-input__inner) {
          height: 100rpx;
          font-size: 30rpx;
        }
      }
    }

    .code-btn-text {
      font-size: 28rpx;
      color: #1a5f8e;
      font-weight: 500;

      &.disabled {
        color: #999;
      }
    }

    .action-btn {
      margin-top: 80rpx;

      :deep(.submit-btn) {
        height: 100rpx !important;
        border-radius: 50rpx !important;
        background: linear-gradient(90deg, #1a5f8e 0%, #3a8fcc 100%) !important;
        font-size: 32rpx !important;
        font-weight: bold !important;
        border: none !important;
        box-shadow: 0 10rpx 20rpx rgba(26, 95, 142, 0.2) !important;
      }
    }

    .agreement-row {
      margin-top: 40rpx;
      display: flex;
      align-items: flex-start;
      gap: 12rpx;
      padding: 0 10rpx;

      .agreement-checkbox {
        transform: scale(0.8);
        margin-top: -4rpx;
      }

      .agreement-text {
        font-size: 24rpx;
        color: #999;
        line-height: 1.6;
        
        .link {
          color: #1a5f8e;
        }
      }
    }

    .sub-actions {
      display: flex;
      justify-content: center;
      margin-top: 60rpx;

      .skip-link {
        font-size: 28rpx;
        color: #666;
      }
    }
  }

  .footer-slogan {
    text-align: center;
    font-size: 28rpx;
    color: #ccc;
    font-family: "STXingkai", "KaiTi", serif;
    margin-bottom: 60rpx;
    letter-spacing: 4rpx;
  }

  .third-party {
    padding-bottom: 60rpx;

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40rpx;

      .line {
        height: 1rpx;
        width: 100rpx;
        background-color: #eee;
      }

      .text {
        font-size: 22rpx;
        color: #ccc;
        margin: 0 20rpx;
      }
    }

    .icons {
      display: flex;
      justify-content: center;
      gap: 80rpx;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .icon-circle {
          width: 88rpx;
          height: 88rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16rpx;
          transition: all 0.2s;

          &.wechat {
            background-color: #07c160;
            box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.2);
          }

          &:active {
            opacity: 0.8;
            transform: scale(0.9);
          }
        }

        .icon-text {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }

  .popup-content {
    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 40rpx;
      text-align: center;
    }

    .input-group {
      display: flex;
      flex-direction: column;

      :deep(.wd-input) {
        margin-bottom: 40rpx;
        background-color: #f8f9fa;
        border-radius: 16rpx;
        padding: 0 30rpx;
        height: 100rpx;
        display: flex;
        align-items: center;
      }

      :deep(.wd-input__inner) {
        height: 100rpx;
        line-height: 100rpx;
        display: flex;
        align-items: center;
      }
    }

    .code-wrapper {
      margin-bottom: 40rpx;

      :deep(.wd-input) {
        margin-bottom: 0;
      }

      .code-btn-text {
        font-size: 30rpx;
        color: #1a5f8e;
        padding: 20rpx 10rpx;

        &.disabled {
          color: #999;
        }
      }
    }

    .action-btn {
      margin-top: 60rpx;
    }
  }
}
</style>
