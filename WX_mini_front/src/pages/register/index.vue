<template>
  <view class="register-container">
    <view class="header">
      <view class="title">注册账号</view>
      <view class="subtitle">欢迎加入优题慧家长</view>
    </view>

    <view class="form-container">
      <view class="input-group">
        <wd-input v-model="nickname" placeholder="请输入昵称" no-border />
        <wd-input v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" no-border />
        <view class="code-wrapper">
          <wd-input v-model="code" placeholder="请输入验证码" type="number" maxlength="6" use-suffix-slot no-border>
            <template #suffix>
              <view class="code-btn-text" :class="{ disabled: countdown > 0 }" @click="countdown === 0 && sendCode()">
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </view>
            </template>
          </wd-input>
        </view>
        <wd-input v-model="password" placeholder="请输入密码" show-password type="text" no-border />
        <wd-input v-model="confirmPassword" placeholder="请确认密码" show-password type="text" no-border />
      </view>

      <view class="action-btn">
        <wd-button type="primary" block @click="handleRegister">注册并登录</wd-button>
      </view>

      <view class="footer-link">
        <text>已有账号？</text>
        <text class="link" @click="goToLogin">立即登录</text>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { sendSmsCode, register } from '@/api/login'

const toast = useToast()

const nickname = ref('')
const phone = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  
  try {
    const res = await sendSmsCode(phone.value)
    // 后端会返回随机生成的验证码，这里通过 toast 提示一下方便测试
    toast.success(`验证码已发送: ${res.data}`)
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

const handleRegister = async () => {
  if (!nickname.value) {
    toast.show('请输入昵称')
    return
  }
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  if (!code.value) {
    toast.show('请输入验证码')
    return
  }
  if (!password.value) {
    toast.show('请输入密码')
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.show('两次输入的密码不一致')
    return
  }
  
  try {
    const res = await register({
      phone: phone.value,
      password: password.value,
      nickname: nickname.value,
      code: code.value
    })

    if (res.code === 200) {
      toast.success('注册成功')
      // 注册成功后自动登录或跳转到登录页
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 1500)
    }
  } catch (error: any) {
    toast.show(error.msg || '注册失败')
  }
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;

  .header {
    margin-top: 60rpx;
    margin-bottom: 60rpx;
    .title {
      font-size: 56rpx;
      font-weight: bold;
      color: #333;
    }
    .subtitle {
      font-size: 28rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }

  .form-container {
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
      margin-top: 80rpx;
    }

    .footer-link {
      display: flex;
      justify-content: center;
      margin-top: 40rpx;
      font-size: 28rpx;
      color: #666;

      .link {
        color: #1a5f8e;
        margin-left: 10rpx;
        font-weight: 500;
      }
    }
  }
}
</style>
