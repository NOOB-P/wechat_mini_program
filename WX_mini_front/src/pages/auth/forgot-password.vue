<template>
  <view class="forgot-password-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">忘记密码</view>
    </view>

    <view class="form-card">
      <wd-input
        v-model="phone"
        placeholder="请输入手机号"
        clearable
        type="number"
        maxlength="11"
      />
      <wd-button type="primary" block custom-class="next-btn" @click="handleNext">下一步</wd-button>

      <view class="bottom-link">
        <text @click="gotoForgotAccount">忘记学生账号？</text>
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
    // Adjust for the back icon width to keep title centered
    transform: translateX(-20rpx);
  }
}

.form-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;

  .next-btn {
    margin-top: 20rpx;
    --wd-button-primary-bg-color: #00c8a0;
    --wd-button-primary-border-color: #00c8a0;
  }

  .bottom-link {
    margin-top: 20rpx;
    text-align: center;
    font-size: 28rpx;
    color: #007aff;
  }
}
</style>
