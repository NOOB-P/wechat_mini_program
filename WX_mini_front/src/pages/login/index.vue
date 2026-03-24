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
        <text class="link" @click="goToRegister">注册账号</text>
        <text class="link" @click="goToForgotPassword">忘记密码？</text>
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
          <!-- Wot Design Uni icon wechat -->
          <wd-icon name="wechat" size="40px" color="#07C160" />
          <text class="icon-text">微信</text>
        </view>
        <view class="icon-item" @click="thirdPartyLogin('qq')">
          <!-- Wot Design Uni might not have QQ icon natively, fallback to a text or check if qq is there -->
          <wd-icon name="qq" size="40px" color="#12B7F5" />
          <text class="icon-text">QQ</text>
        </view>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { sendSmsCode, loginByPhone, loginByPassword } from '@/api/login'

const toast = useToast()

const loginType = ref('phone')
const phone = ref('')
const code = ref('')
const password = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const token = uni.getStorageSync('token')
  if (token) {
    uni.switchTab({ url: '/pages/index/index' })
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
    toast.show('请输入手机号')
    return
  }
  if (loginType.value === 'phone' && !code.value) {
    toast.show('请输入验证码')
    return
  }
  if (loginType.value === 'password' && !password.value) {
    toast.show('请输入密码')
    return
  }
  
  try {
    let res
    if (loginType.value === 'phone') {
      res = await loginByPhone(phone.value, code.value)
    } else {
      res = await loginByPassword(phone.value, password.value)
    }

    // 存储 token (假设返回结构中有 data.token)
    if (res.data && res.data.token) {
      uni.setStorageSync('token', res.data.token)
    } else {
      // 兼容模拟数据的 token 存储
      uni.setStorageSync('token', 'mock_token_123456')
    }
    
    toast.success('登录成功')
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error) {
    console.error('登录失败', error)
  }
}

const goToRegister = () => {
  toast.show('跳转到注册页面')
}

const goToForgotPassword = () => {
  toast.show('跳转到找回密码页面')
}

const thirdPartyLogin = (type: string) => {
  toast.success(`正在使用${type === 'wechat' ? '微信' : 'QQ'}登录...`)
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
}
</style>
