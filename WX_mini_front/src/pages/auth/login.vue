<template>
  <view class="login-page">
    <view class="welcome-section">
      <image class="logo" src="/static/logo.png" />
      <view class="welcome-text">欢迎来到优题慧</view>
      <view class="sub-text">若该手机号未注册，我们将为您自动注册</view>
    </view>

    <view class="login-form">
      <wd-tabs v-model="loginType" custom-class="login-tabs">
        <wd-tab title="快捷登录" name="quick"></wd-tab>
        <wd-tab title="账号登录" name="account"></wd-tab>
      </wd-tabs>

      <view v-if="loginType === 'quick'" class="tab-panel">
        <wd-input
          v-model="phone"
          placeholder="请输入手机号"
          clearable
          type="number"
          maxlength="11"
          use-suffix-slot
        >
          <template #suffix>
            <wd-icon name="arrow-down" />
          </template>
        </wd-input>
        <view class="code-input-wrapper">
          <wd-input
            v-model="code"
            placeholder="请输入验证码"
            clearable
            type="number"
            maxlength="6"
          />
          <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
          </wd-button>
        </view>
      </view>

      <view v-if="loginType === 'account'" class="tab-panel">
        <wd-input
          v-model="account"
          placeholder="请输入手机号/账号"
          clearable
          maxlength="20"
        />
        <wd-input
          v-model="password"
          placeholder="请输入密码"
          clearable
          show-password
          type="password"
        />
      </view>

      <wd-button type="primary" block custom-class="login-btn" @click="handleLogin">登录</wd-button>

      <view class="form-links">
        <text class="link" @click="gotoForgotPassword">忘记密码</text>
        <text class="link" @click="gotoForgotAccount">忘记账号</text>
      </view>

      <view class="agreement">
        <wd-checkbox v-model="agreed" shape="square" />
        <text class="agreement-text">
          我已阅读并同意
          <text class="link-blue" @click="viewAgreement('user')">用户协议</text>、
          <text class="link-blue" @click="viewAgreement('privacy')">隐私政策</text>、
          <text class="link-blue" @click="viewAgreement('children')">儿童隐私保护政策</text>
        </text>
      </view>
    </view>

    <view class="third-party-login">
      <view class="divider">第三方账号登录</view>
      <view class="icons">
        <view class="icon-item">
          <wd-icon name="wechat" custom-class="wechat-icon" />
          <text>微信</text>
        </view>
        <view class="icon-item">
          <wd-icon name="qq" custom-class="qq-icon" />
          <text>身份认证</text>
        </view>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { sendSmsCode, loginByPhone, loginByPassword } from '@/api/auth/login'

const toast = useToast()

const loginType = ref('quick') // quick | account
const phone = ref('13800000000')
const code = ref('')
const account = ref('13800000000')
const password = ref('')
const countdown = ref(0)
const agreed = ref(true)

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  try {
    toast.loading('发送中...')
    await sendSmsCode(phone.value)
    toast.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    toast.error('发送失败，请稍后重试')
  }
}

const handleLogin = async () => {
  if (!agreed.value) {
    toast.show('请先阅读并同意用户协议')
    return
  }

  try {
    toast.loading('登录中...')
    let res: any
    if (loginType.value === 'quick') {
      if (!phone.value) return toast.show('请输入手机号')
      if (!code.value) return toast.show('请输入验证码')
      res = await loginByPhone({ phone: phone.value, code: code.value })
    } else {
      if (!account.value) return toast.show('请输入手机号/账号')
      if (!password.value) return toast.show('请输入密码')
      res = await loginByPassword({ account: account.value, password: password.value })
    }

    if (res.code === 200) {
      uni.setStorageSync('token', res.data.token)
      toast.success('登录成功')
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      toast.error(res.msg || '登录失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误，请稍后重试')
  }
}

const gotoForgotPassword = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}

const gotoForgotAccount = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-account' })
}

const viewAgreement = (type: string) => {
  // MOCK: 跳转到对应的协议页面
  uni.navigateTo({ url: `/pages/agreement?type=${type}` })
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #e6f7ff 0%, #ffffff 40%);
  padding: 32rpx;
  box-sizing: border-box;
}

.welcome-section {
  padding-top: 80rpx;
  padding-bottom: 60rpx;
  text-align: center;
  .logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-bottom: 24rpx;
  }
  .welcome-text {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
  }
  .sub-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.login-form {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.05);

  .login-tabs {
    margin-bottom: 40rpx;
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
  }

  .code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 20rpx;
    .code-btn {
      flex-shrink: 0;
    }
  }

  .login-btn {
    margin-top: 40rpx;
    --wd-button-primary-bg-color: #00c8a0;
    --wd-button-primary-border-color: #00c8a0;
  }

  .form-links {
    display: flex;
    justify-content: space-between;
    margin-top: 32rpx;
    font-size: 28rpx;
    .link {
      color: #666;
    }
  }

  .agreement {
    display: flex;
    align-items: center;
    margin-top: 40rpx;
    .agreement-text {
      font-size: 24rpx;
      color: #999;
      margin-left: 16rpx;
      .link-blue {
        color: #007aff;
      }
    }
  }
}

.third-party-login {
  margin-top: auto;
  padding-top: 60rpx;
  padding-bottom: 40rpx;
  .divider {
    color: #999;
    font-size: 24rpx;
    text-align: center;
    margin-bottom: 40rpx;
  }
  .icons {
    display: flex;
    justify-content: center;
    gap: 80rpx;
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      font-size: 24rpx;
      color: #666;
      .wechat-icon {
        font-size: 64rpx !important;
        color: #07c160;
      }
      .qq-icon {
        font-size: 64rpx !important;
        color: #12b7f5;
      }
    }
  }
}
</style>
