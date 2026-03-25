<template>
  <view class="reset-password-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">重置密码</view>
    </view>

    <view class="form-card">
      <view class="code-input-wrapper">
        <wd-input v-model="form.code" label="验证码" placeholder="请输入验证码" />
        <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
          {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
        </wd-button>
      </view>
      <wd-input v-model="form.password" label="新密码" placeholder="请输入新密码" type="password" show-password />
      <wd-button type="primary" block custom-class="confirm-btn" @click="handleReset">确认</wd-button>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { sendForgotPasswordCode, resetPassword } from '@/api/auth/forgot-password'

const toast = useToast()
const countdown = ref(0)

const form = reactive({
  phone: '',
  code: '',
  password: ''
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  form.phone = currentPage.options.phone || ''
  if (form.phone) {
    sendCode() // 页面加载时自动发送一次验证码
  }
})

const goBack = () => uni.navigateBack()

const sendCode = async () => {
  if (!form.phone) return toast.show('手机号不存在')
  try {
    toast.loading('发送中...')
    await sendForgotPasswordCode(form.phone)
    toast.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error) {
    toast.error('发送失败')
  }
}

const handleReset = async () => {
  const { phone, code, password } = form
  if (!code || !password) {
    return toast.show('请填写完整信息')
  }
  try {
    toast.loading('正在重置...')
    const res = await resetPassword({ phone, code, password })
    if (res.code === 200) {
      toast.success('密码重置成功')
      setTimeout(() => uni.navigateTo({ url: '/pages/auth/login' }), 1500)
    } else {
      toast.error(res.msg || '重置失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}
</script>

<style lang="scss" scoped>
.reset-password-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 32rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 40rpx;
  .back-icon {
    font-size: 40rpx !important;
    color: #333;
  }
  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    transform: translateX(-20rpx);
  }
}

.form-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;

  .code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 20rpx;
    .code-btn {
      flex-shrink: 0;
    }
  }

  .confirm-btn {
    margin-top: 20rpx;
    --wd-button-primary-bg-color: #00c8a0;
    --wd-button-primary-border-color: #00c8a0;
  }
}
</style>
