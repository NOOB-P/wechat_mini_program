<template>
  <view class="forgot-password-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">忘记密码</view>
    </view>

    <view class="form-container">
      <view class="input-group">
        <wd-input
          v-model="phone"
          placeholder="请输入手机号"
          clearable
          type="number"
          maxlength="11"
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

const toast = useToast()
const phone = ref('13800000000')

const goBack = () => {
  uni.navigateBack()
}

const handleNext = () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  // MOCK: 跳转到验证/重置密码页面，并携带手机号
  uni.navigateTo({ url: `/pages/auth/reset-password?phone=${phone.value}` })
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

  .action-btn {
    margin-top: 80rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: center;
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
