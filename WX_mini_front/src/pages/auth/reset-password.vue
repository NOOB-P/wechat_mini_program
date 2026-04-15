<template>
  <view class="reset-password-page">
    <view class="form-container">
      <view class="input-group">
        <view class="code-wrapper">
          <wd-input v-model="form.code" placeholder="请输入验证码" type="number" :maxlength="6" use-suffix-slot no-border>
            <template #suffix>
              <view class="code-btn-text" :class="{ disabled: countdown > 0 }" @click="countdown === 0 && sendCode()">
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </view>
            </template>
          </wd-input>
        </view>
        <wd-input v-model="form.password" placeholder="请输入新密码" show-password type="text" no-border />
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
  const currentPage = pages[pages.length - 1] as
    | { options?: Record<string, string | undefined> }
    | undefined
  form.phone = currentPage?.options?.phone ?? ''
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
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  margin-top: 40rpx;

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
  }

  .action-btn {
    margin-top: 80rpx;
  }
}
</style>
