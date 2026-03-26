<template>
  <view class="reset-password-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">重置密码</view>
    </view>

    <view class="form-container">
      <view class="input-group">
        <view class="code-wrapper">
          <wd-input v-model="form.code" placeholder="请输入验证码" clearable type="number" maxlength="6" />
          <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
          </wd-button>
        </view>
        <wd-input v-model="form.password" placeholder="请输入新密码" clearable show-password type="text" />
      </view>
      <view class="action-btn">
        <wd-button type="primary" block @click="handleReset">确认</wd-button>
      </view>
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
      setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 1500)
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
  padding: 120rpx 32rpx 32rpx; // 增加了顶部的 padding (原来是 32rpx) 避免被刘海屏挡住
  box-sizing: border-box;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0; // 增加了内边距
  margin-bottom: 60rpx; // 增加与下方卡片的距离
  position: relative; // 增加定位以便于扩大点击区域而不影响布局
  z-index: 10;
  .back-icon {
    font-size: 44rpx !important; // 稍微放大一点图标
    color: #333;
    padding: 20rpx; // 增加点击区域
    margin-left: -20rpx; // 抵消 padding 带来的位移
  }
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
}
</style>
