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
  background-color: #f7f8fa;
  padding: 120rpx 32rpx 32rpx; // 增加了顶部的 padding (原来是 32rpx) 避免被刘海屏挡住
  box-sizing: border-box;
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
