<template>
  <view class="login-container">
    <view class="header">
      <view class="title">欢迎登录</view>
    </view>

    <view class="form-container">
      <wd-tabs v-model="loginType">
        <wd-tab title="手机验证码登录" name="phone">
          <view class="input-group">
            <wd-input v-model="phone" placeholder="请输入手机号" clearable type="number" maxlength="11" />
            <view class="code-wrapper">
              <wd-input v-model="code" placeholder="请输入验证码" clearable type="number" maxlength="6" />
              <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </wd-button>
            </view>
          </view>
        </wd-tab>
        <wd-tab title="密码登录" name="password">
          <view class="input-group">
            <wd-input v-model="phone" placeholder="请输入手机号" clearable type="number" maxlength="11" />
            <wd-input v-model="password" placeholder="请输入密码" clearable show-password type="text" />
          </view>
        </wd-tab>
      </wd-tabs>

      <view class="action-btn">
        <wd-button type="primary" block @click="handleLogin">登录</wd-button>
      </view>

      <view class="sub-actions">
        <text class="link" @click="goToRegister">立即注册</text>
        <text class="link" @click="goToForgotPassword">找回密码</text>
      </view>
    </view>

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
        <view class="icon-item" @click="thirdPartyLogin('qq')">
          <wd-icon name="qq" size="40px" color="#12B7F5" />
          <text class="icon-text">QQ</text>
        </view>
      </view>
    </view>
    
    <wd-popup v-model="showRegisterPopup" position="bottom" custom-style="height: 70%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="popup-title">快速注册</view>
        <view class="input-group">
          <wd-input v-model="registerForm.phone" placeholder="请输入手机号" clearable type="number" maxlength="11" />
          <view class="code-wrapper">
            <wd-input v-model="registerForm.code" placeholder="请输入验证码" clearable type="number" maxlength="6" />
            <wd-button class="code-btn" type="primary" plain size="small" @click="sendRegisterCode" :disabled="registerCountdown > 0">
              {{ registerCountdown > 0 ? `${registerCountdown}s后重试` : '获取验证码' }}
            </wd-button>
          </view>
          <wd-input v-model="registerForm.password" placeholder="请设置密码" clearable show-password type="text" />
          <wd-input v-model="registerForm.nickname" placeholder="请输入昵称" clearable type="text" />
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleRegister">立即注册</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup v-model="showForgotPopup" position="bottom" custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="popup-title">找回密码</view>
        <view class="input-group">
          <wd-input v-model="forgotForm.phone" placeholder="请输入手机号" clearable type="number" maxlength="11" />
          <view class="code-wrapper">
            <wd-input v-model="forgotForm.code" placeholder="请输入验证码" clearable type="number" maxlength="6" />
            <wd-button class="code-btn" type="primary" plain size="small" @click="sendForgotCode" :disabled="forgotCountdown > 0">
              {{ forgotCountdown > 0 ? `${forgotCountdown}s后重试` : '获取验证码' }}
            </wd-button>
          </view>
          <wd-input v-model="forgotForm.password" placeholder="请输入新密码" clearable show-password type="text" />
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleForgot">重置密码</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { sendSmsCode, loginByPhone, loginByPassword, register, forgotPassword, thirdPartyLoginApi } from '@/api/login'

const toast = useToast()

const loginType = ref('phone')
const phone = ref('')
const code = ref('')
const password = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 注册相关
const showRegisterPopup = ref(false)
const registerCountdown = ref(0)
let registerTimer: ReturnType<typeof setInterval> | null = null
const registerForm = ref({
  phone: '',
  code: '',
  password: '',
  nickname: ''
})

// 找回密码相关
const showForgotPopup = ref(false)
const forgotCountdown = ref(0)
let forgotTimer: ReturnType<typeof setInterval> | null = null
const forgotForm = ref({
  phone: '',
  code: '',
  password: ''
})

onMounted(() => {
  const token = uni.getStorageSync('token')
  if (token) {
    // 如果已经登录，直接进入首页
    uni.switchTab({ url: '/pages/home/index' })
  }
})

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  
  try {
    await sendSmsCode(phone.value)
    toast.success('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败', error)
  }
}

const handleLogin = async () => {
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
    let res
    if (loginType.value === 'phone') {
      res = await loginByPhone({ phone: phone.value, code: code.value })
    } else {
      res = await loginByPassword({ phone: phone.value, password: password.value })
    }

    if (res.code === 200) {
      if (res.data && res.data.token) {
        uni.setStorageSync('token', res.data.token)
      }
      toast.success('登录成功')
      
      // 修改点：因为登录页是启动页，跳转到绑定页必须使用 redirectTo
      // 这样跳转后页面栈会替换，用户在绑定页按返回键不会回到登录页
      setTimeout(() => {
        uni.redirectTo({ 
          url: `/pages/auth/bind-student?phone=${phone.value}` 
        })
      }, 1500)
    } else {
      toast.error(res.msg || '登录失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误，请稍后重试')
  }
}

const goToRegister = () => {
  showRegisterPopup.value = true
}

const goToForgotPassword = () => {
  // 注意：如果 forgot-password 也是独立页面，建议检查其返回逻辑
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}

// 注册逻辑
const sendRegisterCode = async () => {
  if (!registerForm.value.phone || registerForm.value.phone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  try {
    await sendSmsCode(registerForm.value.phone)
    toast.success('验证码已发送')
    registerCountdown.value = 60
    registerTimer = setInterval(() => {
      registerCountdown.value--
      if (registerCountdown.value <= 0) {
        clearInterval(registerTimer!)
      }
    }, 1000)
  } catch (error) {}
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
    } else {
      toast.error(res.msg || '注册失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

// 找回密码逻辑
const sendForgotCode = async () => {
  if (!forgotForm.value.phone || forgotForm.value.phone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  try {
    await sendSmsCode(forgotForm.value.phone)
    toast.success('验证码已发送')
    forgotCountdown.value = 60
    forgotTimer = setInterval(() => {
      forgotCountdown.value--
      if (forgotCountdown.value <= 0) {
        clearInterval(forgotTimer!)
      }
    }, 1000)
  } catch (error) {}
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
    } else {
      toast.error(res.msg || '重置失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const thirdPartyLogin = (type: string) => {
  if (type === 'wechat') {
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        if (loginRes.code) {
          try {
            const res = await thirdPartyLoginApi('wechat', loginRes.code)
            if (res.data && res.data.token) {
              uni.setStorageSync('token', res.data.token)
            }
            toast.success('微信登录成功')
            // 第三方登录通常直接进首页
            setTimeout(() => {
              uni.switchTab({ url: '/pages/home/index' })
            }, 1500)
          } catch (error) {}
        }
      },
      fail: () => {
        toast.show('微信登录失败')
      }
    })
  } else if (type === 'qq') {
    uni.login({
      provider: 'qq',
      success: async (loginRes) => {
        try {
          const res = await thirdPartyLoginApi('qq', 'mock_qq_openid')
          if (res.data && res.data.token) {
            uni.setStorageSync('token', res.data.token)
          }
          toast.success('QQ登录成功')
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/index' })
          }, 1500)
        } catch (error) {}
      },
      fail: () => {
        mockThirdPartyLogin('qq')
      }
    })
  }
}

const mockThirdPartyLogin = async (type: string) => {
  toast.success(`正在模拟${type === 'wechat' ? '微信' : 'QQ'}登录...`)
  try {
    const res = await thirdPartyLoginApi(type, `mock_${type}_openid_123`)
    if (res.data && res.data.token) {
      uni.setStorageSync('token', res.data.token)
    }
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {}
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;

  .header {
    margin-top: 100rpx;
    margin-bottom: 80rpx;
    .title {
      font-size: 56rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .form-container {
    flex: 1;

    .input-group {
      margin-top: 40rpx;
      display: flex;
      flex-direction: column;
      gap: 30rpx;
    }

    .code-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      
      :deep(.wd-input) {
        flex: 1;
      }
      
      .code-btn {
        margin-left: 20rpx;
        min-width: 200rpx;
      }
    }

    .action-btn {
      margin-top: 80rpx;
    }

    .sub-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 40rpx;
      padding: 0 10rpx;

      .link {
        font-size: 28rpx;
        color: #666;
        
        &:active {
          color: #1a5f8e;
        }
      }
    }
  }

  .third-party {
    margin-top: auto;
    padding-bottom: 100rpx;

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 60rpx;

      .line {
        height: 1rpx;
        width: 120rpx;
        background-color: #eee;
      }

      .text {
        font-size: 24rpx;
        color: #999;
        margin: 0 30rpx;
      }
    }

    .icons {
      display: flex;
      justify-content: center;
      gap: 100rpx;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16rpx;

        .icon-text {
          font-size: 24rpx;
          color: #666;
        }
        
        &:active {
          opacity: 0.7;
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
      gap: 30rpx;
    }
    
    .code-wrapper {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      :deep(.wd-input) {
        flex: 1;
      }
      
      .code-btn {
        min-width: 180rpx;
      }
    }
    
    .action-btn {
      margin-top: 60rpx;
    }
  }
}
</style>