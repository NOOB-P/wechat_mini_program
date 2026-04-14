<template>
  <view class="forgot-password-page">
    <view class="form-container">
      <view class="input-group">
        <wd-input
          v-model="phone"
          placeholder="请输入手机号"
          type="number"
          :maxlength="11"
          no-border
        />
      </view>
      
      <view class="action-btn">
        <wd-button type="primary" block @click="handleNext">下一步</wd-button>
      </view>

      <view class="sub-actions">
        <text class="link" @click="gotoForgotAccount">忘记学生账号？</text>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { verifyPhoneAccountApi } from '@/api/auth/forgot-password'

const toast = useToast()
const phone = ref('13800000000')

const goBack = () => {
  uni.navigateBack()
}

const handleNext = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  
  try {
    toast.loading('验证中...')
    const res = await verifyPhoneAccountApi(phone.value)
    if (res.code === 200) {
      toast.close()
      uni.navigateTo({ url: `/pages/auth/reset-password?phone=${phone.value}` })
    } else {
      toast.error(res.msg || '手机号未注册')
    }
  } catch (error: any) {
    toast.error(error.msg || '验证失败')
  }
}

const gotoForgotAccount = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-account' })
}
</script>

<style lang="scss" scoped>
.forgot-password-page {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 10;
  .back-icon {
    font-size: 44rpx !important;
    color: #333;
    padding: 20rpx;
    margin-left: -20rpx;
  }
  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
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
  }

  .action-btn {
    margin-top: 80rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: flex-end;
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
</style>
